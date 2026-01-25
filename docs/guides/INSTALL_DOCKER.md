# Docker Installation Guide for RoboTrader

**Status**: Docker not currently installed
**Platform**: Windows (detected from system)
**Date**: January 20, 2026

---

## Step 1.1.1: Install Docker & Docker Compose

### For Windows (Your Platform)

#### Option 1: Docker Desktop (Recommended)

**Download Docker Desktop**:
1. Go to https://www.docker.com/products/docker-desktop/
2. Click "Download for Windows"
3. Run the installer (`Docker Desktop Installer.exe`)
4. Follow the installation wizard

**System Requirements**:
- Windows 10 64-bit: Pro, Enterprise, or Education (Build 19041 or higher)
- OR Windows 11 64-bit
- WSL 2 backend (will be installed automatically)
- Hardware virtualization enabled in BIOS

**Installation Steps**:
```powershell
# 1. Download from docker.com
# 2. Run installer
# 3. Accept license agreement
# 4. Use WSL 2 backend (recommended)
# 5. Click "Install"
# 6. Restart computer when prompted
```

**After Installation**:
```bash
# Verify Docker is installed
docker --version
# Expected output: Docker version 24.0.x, build xxxxxxx

# Verify Docker Compose is installed (included with Docker Desktop)
docker-compose --version
# Expected output: Docker Compose version v2.x.x

# Test Docker is working
docker run hello-world
# Should download and run a test container
```

---

#### Option 2: Docker Engine (Without Desktop GUI)

**Not recommended for Windows** - Docker Desktop is the official supported method.

---

### For Ubuntu/Debian (Reference)

```bash
# Update package index
sudo apt update

# Install Docker
sudo apt install docker.io docker-compose -y

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add user to docker group (avoid needing sudo)
sudo usermod -aG docker $USER
newgrp docker

# Verify installation
docker --version
docker-compose --version
```

---

### For macOS (Reference)

```bash
# Using Homebrew
brew install --cask docker

# Or download Docker Desktop from:
# https://www.docker.com/products/docker-desktop/

# After installation
docker --version
docker-compose --version
```

---

## Verification Checklist

After installing Docker Desktop, verify the following:

### 1. Docker Version
```bash
docker --version
```
✅ Expected: `Docker version 24.0.x` or higher

### 2. Docker Compose Version
```bash
docker-compose --version
```
✅ Expected: `Docker Compose version v2.x.x` or higher

### 3. Docker Daemon Running
```bash
docker info
```
✅ Expected: Shows Docker system information (memory, containers, etc.)

### 4. Test Container
```bash
docker run hello-world
```
✅ Expected: Successfully pulls and runs test container

### 5. Docker Desktop Application
- Open Docker Desktop application
- Check it shows "Docker Desktop is running"
- Green whale icon in system tray (bottom-right on Windows)

---

## Troubleshooting

### Docker Desktop won't start
**Problem**: Error message "Docker Desktop starting..." forever

**Solutions**:
1. Enable Hyper-V:
   ```powershell
   # Run as Administrator in PowerShell
   Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All
   ```

2. Enable WSL 2:
   ```powershell
   # Run as Administrator
   wsl --install
   wsl --set-default-version 2
   ```

3. Restart computer after enabling features

---

### "Hardware assisted virtualization and data execution protection must be enabled"

**Solution**:
1. Restart computer
2. Enter BIOS/UEFI (usually F2, F10, or DEL key during boot)
3. Enable "Intel VT-x" or "AMD-V" (virtualization)
4. Enable "VT-d" if available
5. Save and exit BIOS

---

### Docker commands not found in Git Bash

**Problem**: `docker: command not found` in Git Bash

**Solution**:
1. Close and reopen Git Bash after Docker Desktop installation
2. Or add Docker to PATH manually:
   ```bash
   export PATH="$PATH:/c/Program Files/Docker/Docker/resources/bin"
   ```

---

### Permission denied error

**Problem**: `permission denied while trying to connect to the Docker daemon socket`

**Solution** (Linux/macOS):
```bash
sudo usermod -aG docker $USER
newgrp docker
```

**Solution** (Windows):
- Docker Desktop handles permissions automatically
- Ensure Docker Desktop is running

---

## Post-Installation Setup

### 1. Configure Docker Resources (Recommended)

Open Docker Desktop → Settings → Resources:

**For RoboTrader (recommended settings)**:
- **CPUs**: 4 cores (or half of your total)
- **Memory**: 8 GB (minimum 4 GB)
- **Disk image size**: 64 GB
- **Swap**: 1 GB

### 2. Enable Docker BuildKit (Optional but recommended)

```bash
# Add to ~/.bashrc or ~/.zshrc
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1
```

### 3. Test Full Stack

```bash
# Test with a simple compose file
cat > docker-compose-test.yml << 'EOF'
version: '3.8'
services:
  hello:
    image: hello-world
EOF

docker-compose -f docker-compose-test.yml up
docker-compose -f docker-compose-test.yml down
rm docker-compose-test.yml
```

✅ If this works, you're ready for RoboTrader installation!

---

## Next Steps (After Docker Installation)

Once Docker is installed and verified, proceed to:

**Task 1.1.2**: Create Project Structure
- See `implementation_tasks_n8n.md` (lines 30-124)
- Create docker-compose.yml for n8n + PostgreSQL
- Set up environment variables

**Or run**:
```bash
# Mark Task 1.1.1 as complete
echo "✅ Step 1.1.1 Complete: Docker installed and verified" >> PHASE1_PROGRESS.md

# Continue to Step 1.1.2
# (Will be implemented after Docker installation)
```

---

## Installation Status Tracking

| Step | Status | Date | Notes |
|------|--------|------|-------|
| 1.1.1 - Check Docker | ✅ Complete | 2026-01-20 | Not installed, guide created |
| 1.1.1 - Install Docker | ⏳ Pending | - | Manual installation required |
| 1.1.1 - Verify Docker | ⏳ Pending | - | Run verification after install |
| 1.1.2 - Project Structure | ⏳ Pending | - | Next step |

---

## Quick Installation (Windows)

```powershell
# 1. Open PowerShell as Administrator
# 2. Enable WSL 2
wsl --install

# 3. Restart computer

# 4. Download Docker Desktop
Start-Process "https://www.docker.com/products/docker-desktop/"

# 5. Install Docker Desktop (run downloaded installer)

# 6. Restart computer again

# 7. Open Git Bash and verify
docker --version
docker-compose --version
docker run hello-world
```

---

**Manual Installation Required**: Please install Docker Desktop following the guide above, then return to continue with Step 1.1.2.

**Estimated Time**: 15-20 minutes (including download and restarts)

---

**Next File to Create After Installation**: `docker-compose.yml` (Task 1.1.2)
