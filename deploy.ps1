# ==============================================================================
# PowAI.ca — Script de Deploiement Universel Production (Serveur 10.0.0.214)
# ==============================================================================
param(
    [string]$ServerHost = "10.0.0.214",
    [string]$ServerUser = "ian"
)

$ErrorActionPreference = "Stop"
Write-Host "🚀 [1/4] Compression des applications..." -ForegroundColor Cyan
$WorkspaceRoot = "c:\Users\ianle\Documents\AudiTREQ"
$ArchiveName = "powai_full_deploy.tar.gz"
$ArchivePath = Join-Path $WorkspaceRoot $ArchiveName

tar.exe -czf $ArchivePath -C $WorkspaceRoot `
    apps/powai-home/dist `
    apps/borne/dist `
    apps/sursitrack/dist `
    apps/web/dist `
    apps/slot-speed/dist `
    apps/slotmachine/dist `
    apps/slot-wonderland/dist `
    packages/api/dist `
    packages/sursitrack-backend/dist

Write-Host "📡 [2/4] Transfert vers $ServerHost..." -ForegroundColor Yellow
scp.exe $ArchivePath "$($ServerUser)@$($ServerHost):/tmp/$ArchiveName"
Remove-Item $ArchivePath -Force -ErrorAction SilentlyContinue

Write-Host "⚙️ [3/4] Extraction et rechargement sur $ServerHost..." -ForegroundColor Yellow
$remoteCmd = "mkdir -p ~/deploy_tmp && tar -xzf /tmp/$ArchiveName -C ~/deploy_tmp && sudo mkdir -p /var/www/html/borne /var/www/html/sursitrack /var/www/html/auditreq /var/www/html/speed /var/www/html/slot /var/www/html/alice && sudo cp -r ~/deploy_tmp/apps/borne/dist/* /var/www/html/borne/ && sudo cp -r ~/deploy_tmp/apps/sursitrack/dist/* /var/www/html/sursitrack/ && sudo cp -r ~/deploy_tmp/apps/web/dist/* /var/www/html/auditreq/ && sudo cp -r ~/deploy_tmp/apps/slot-speed/dist/* /var/www/html/speed/ && sudo cp -r ~/deploy_tmp/apps/slotmachine/dist/* /var/www/html/slot/ && sudo cp -r ~/deploy_tmp/apps/slot-wonderland/dist/* /var/www/html/alice/ && sudo cp -r ~/deploy_tmp/apps/powai-home/dist/* /var/www/html/ && sudo chown -R www-data:www-data /var/www/html && rm -rf ~/deploy_tmp /tmp/$ArchiveName && (cd /home/ian/AudiTREQ && pm2 reload all 2>/dev/null || pm2 start ecosystem.config.cjs) && pm2 save && sudo systemctl reload nginx"

ssh.exe "$($ServerUser)@$($ServerHost)" $remoteCmd
Write-Host "✅ [4/4] Deploiement termine avec succes !" -ForegroundColor Green
