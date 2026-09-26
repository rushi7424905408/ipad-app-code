# WortSchatz • Multi-Architecture Container for Self-Hosting (iPad Air M3 Friendly)
FROM python:3.11-alpine

LABEL maintainer="WortSchatz Team"
LABEL description="Self-hosted German PDF Reader with Instant Translation & Obsidian Sync"

WORKDIR /app

# Copy all application assets
COPY . /app

# Expose HTTP port
EXPOSE 8000

# Create volume mount point for Obsidian Vault synchronization
VOLUME ["/root/Desktop/Obsidian Vault"]

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD python3 -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/index.html')" || exit 1

CMD ["python3", "app.py"]
