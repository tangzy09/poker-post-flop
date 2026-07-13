#!/usr/bin/env node
/* feedback-server.js — 收站内意见反馈的极简后端(零依赖 node:http)。
   跑在 EC2 上,nginx 把 /api/feedback 反代过来;落 jsonl,不入库、不上第三方 SDK。

   部署(EC2,一次性):
     scp tools/feedback-server.js ec2-user@HOST:/opt/postflop-feedback/
     sudo mkdir -p /var/data/postflop && sudo chown ec2-user /var/data/postflop
     # systemd unit: /etc/systemd/system/postflop-feedback.service
     #   [Service]
     #   ExecStart=/usr/bin/node /opt/postflop-feedback/feedback-server.js
     #   Environment=FB_PORT=8791 FB_FILE=/var/data/postflop/feedback.jsonl
     #   Restart=always
     #   User=ec2-user
     #   [Install] WantedBy=multi-user.target
     sudo systemctl enable --now postflop-feedback

   nginx(post-flop-coach 的 server 块内,限流防刷):
     limit_req_zone $binary_remote_addr zone=fb:10m rate=10r/m;   # http{} 里
     location = /api/feedback {
       limit_req zone=fb burst=5 nodelay;
       proxy_pass http://127.0.0.1:8791/;
       proxy_set_header X-Real-IP $remote_addr;
     }

   读反馈:  ssh ... "tail -n 50 /var/data/postflop/feedback.jsonl | node -e ..."
   或本地:  node tools/feedback-read.js(见下方注释,直接 jq 也行)

   ⚠ 收上来只是第一步。闭环才是收益来源:能修的真去修,修完回访告诉他。
      商店后台 1–3 星 100% 回复 —— 回复后 4.4% 的用户会上调评分(不回复只有 0.7%)。 */

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.FB_PORT || 8791);
const FILE = process.env.FB_FILE || path.join(__dirname, "..", "feedback.jsonl");
const MAX_BODY = 32 * 1024;

const server = http.createServer((req, res) => {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
  if (req.method === "OPTIONS") return res.writeHead(204, cors).end();
  if (req.method !== "POST") return res.writeHead(405, cors).end();

  let body = "";
  let tooBig = false;
  req.on("data", (c) => {
    body += c;
    if (body.length > MAX_BODY && !tooBig) {
      tooBig = true;
      res.writeHead(413, cors).end();
      req.destroy();
    }
  });
  req.on("end", () => {
    if (tooBig) return;
    let p;
    try {
      p = JSON.parse(body);
    } catch (e) {
      return res.writeHead(400, cors).end();
    }
    const text = String(p.text || "").trim().slice(0, 2000);
    if (!text) return res.writeHead(400, cors).end();

    const rec = {
      at: new Date().toISOString(),
      ip: req.headers["x-real-ip"] || req.socket.remoteAddress || null,
      category: String(p.category || "other").slice(0, 24),
      text,
      diag: p.diag || null,
    };
    try {
      fs.appendFileSync(FILE, JSON.stringify(rec) + "\n");
    } catch (e) {
      console.error("append failed:", e.message);
      return res.writeHead(500, cors).end();
    }
    console.log("[feedback]", rec.category, "|", text.slice(0, 80));
    res.writeHead(200, Object.assign({ "Content-Type": "application/json" }, cors)).end('{"ok":true}');
  });
});

server.listen(PORT, "127.0.0.1", () => console.log("feedback-server on 127.0.0.1:" + PORT + " → " + FILE));
