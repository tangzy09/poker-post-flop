# Deploy static site to EC2 (post-flop-coach)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$Key = "C:\Users\tangz\Documents\ec2_1.pem"
$Remote = "ec2-user@3.26.95.240"
$Dest = "/var/www/post-flop-coach"

if (-not (Test-Path $Key)) { throw "SSH key not found: $Key" }

Write-Host "Stamping cache-bust version in index.html ..."
node "$Root\tools\stamp-version.js"

Write-Host "Uploading to ${Remote}:${Dest} ..."
scp -i $Key -o StrictHostKeyChecking=no "$Root\index.html" "$Root\privacy.html" "$Root\robots.txt" "$Root\sitemap.xml" "$Root\og-image.png" "$Root\google8d5971246131b6a2.html" "$Root\0cbdca4f25a2f705cec63fd3e0517869.txt" "${Remote}:${Dest}/"
scp -i $Key -o StrictHostKeyChecking=no -r "$Root\js" "$Root\data" "$Root\courses" "$Root\terms" "$Root\calc" "${Remote}:${Dest}/"
ssh -i $Key -o StrictHostKeyChecking=no $Remote "chmod -R a+rX $Dest; find $Dest -type d -exec chmod 755 {} \; ; find $Dest -type f -exec chmod 644 {} \;"
Write-Host "Done. https://post-flop-coach.ai-speeds.com/"
