#!/bin/bash

# EnhanceMD Development Setup Script for Fedora

echo "🚀 Setting up EnhanceMD development environment..."

# Install VS Code (optional, but recommended)
echo "📝 Installing VS Code..."
sudo rpm --import https://packages.microsoft.com/keys/microsoft.asc
sudo sh -c 'echo -e "[code]\nname=Visual Studio Code\nbaseurl=https://packages.microsoft.com/yumrepos/vscode\nenabled=1\ngpgcheck=1\ngpgkey=https://packages.microsoft.com/keys/microsoft.asc" > /etc/yum.repos.d/vscode.repo'
sudo dnf install code -y

# Install development dependencies
echo "📦 Installing build tools..."
sudo dnf groupinstall "Development Tools" -y
sudo dnf install gcc-c++ make -y

# Install PostgreSQL (for future user data)
echo "🗄️ Installing PostgreSQL..."
sudo dnf install postgresql postgresql-server -y

# Install Redis (for caching/sessions)
echo "⚡ Installing Redis..."
sudo dnf install redis -y

# Install yarn globally
echo "🧶 Installing Yarn..."
npm install -g yarn

# Create project structure
echo "📁 Creating project structure..."
mkdir -p ~/Documents/Solutions/1.\ Projects/0pon/EnhanceMD/{client,server,shared}

echo "✅ Setup complete! Ready to build EnhanceMD"