# Configuration to add to your existing /etc/cloudflared/config.yml
# 
# Add this to your ingress section (before the catch-all service):
#
#   - hostname: ping.binoy.co
#     service: http://localhost:3002
#
# Your full ingress section should look something like:
#
# ingress:
#   - hostname: ping.binoy.co
#     service: http://localhost:3002
#   - hostname: jellyfin.binoy.co  # (or whatever your existing service is)
#     service: http://localhost:8096  # (or your existing port)
#   - service: http_status:404  # catch-all (must be last)
#
# After updating the config, restart cloudflared with:
# sudo systemctl restart cloudflared
#
# OR if running via docker:
# docker restart cloudflared
