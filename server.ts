import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PACKAGES_DATA = [
  "Abseil-cpp", "alsa-lib", "alsa-plugins", "apt", "bash", "brotli", "c-ares", 
  "ca-certificates", "ca-certificates-java", "capstone", "clang", "command-not-found", 
  "composer", "coreutils", "curl", "dash", "dbus", "debianutils", "diffutils", 
  "dos2unix", "dpkg", "ed", "findutils", "freetype", "gawk", "gdbm", "gh", "giflib", 
  "git", "glab-cli", "glib", "golang", "gotify", "gpgv", "gradle", "grep", 
  "inetutils", "krb5", "ldns", "less", "libandroid-execinfo", "libandroid-glob", 
  "libandroid-posix-semaphore", "libandroid-selinux", "libandroid-shmem", 
  "libandroid-spawn", "libandroid-support", "libandroid-sysv-semaphore", 
  "libassuan", "libbz2", "libc++", "libcap-ng", "libcompiler-rt", "libcrypt", 
  "libcurl", "libdb", "libedit", "libexpat", "libffi", "libflac", "libgcrypt", 
  "libgmp", "libgpg-error", "libiconv", "libicu", "libidn2", "libjpeg-turbo", 
  "libllvm", "libltdl", "liblzma", "libmd", "libmp3lame", "libmpfr", "libnghttp2", 
  "libnghttp3", "libngtcp2", "libnpth", "libogg", "libopus", "libpng", 
  "libresolv-wrapper", "libsmartcols", "libsndfile", "libsoxr", "libsqlite", 
  "libssh2", "libtalloc", "libunistring", "libuuid", "libvorbis", 
  "libwebrtc-audio-processing", "libx11", "libxau", "libxcb", "libxdmcp", 
  "libxext", "libxi", "libxml2", "libxrender", "libxslt", "libxtst", "libyaml", 
  "libzip", "littlecms", "lld", "llvm", "lua51", "lua54", "luarocks", "make", 
  "nano", "ncurses", "ncurses-ui-libs", "ndk-sysroot", "net-tools", "nodejs", 
  "npm", "ollama", "oniguruma", "openjdk-21", "openjdk-21-x", "openssh", 
  "openssh-sftp-server", "openssl", "openssl-tool", "patch", "pcre2", "php", 
  "pkg-config", "procps", "proot", "proot-distro", "psmisc", "pulseaudio", 
  "python", "python-ensurepip-wheels", "python-pip", "python2", "railway-cli", 
  "readline", "resolv-conf", "ruby", "rust", "rust-std-aarch64-linux-android", 
  "sed", "socat", "speexdsp", "tar", "termux-am", "termux-auth", "termux-exec", 
  "termux-keyring", "termux-licenses", "termux-tools", "tidy", "unzip", 
  "util-linux", "vpn-tool", "wget", "xxhash", "yarn", "zip", "zlib", "zstd"
];

async function startServer() {
  const app = express();
  app.use(express.json());

  // API endpoint for packages.json as requested
  app.get('/api/list-package.json', (req, res) => {
    res.json({
      count: PACKAGES_DATA.length,
      generatedAt: new Date().toISOString(),
      packages: PACKAGES_DATA
    });
  });

  // AI package insights route using Gemini API
  app.post('/api/ai-package-insights', async (req, res) => {
    const { packageName } = req.body;
    if (!packageName) {
      return res.status(400).json({ error: 'Package name is required' });
    }

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.json({
          insights: `Static overview for ${packageName}: A reliable Termux / Linux package widely used for command-line operations, scripting, and system utilities.`
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Provide a concise, professional technical summary, common use cases, and typical installation/usage commands for the Termux/Linux package "${packageName}". Keep it under 150 words in markdown format.`
      });

      res.json({ insights: response.text || 'No insights generated.' });
    } catch (err: any) {
      console.error('Gemini API error:', err);
      res.json({
        insights: `Technical overview for ${packageName}: Essential package in Termux for system integration and development workflows.`
      });
    }
  });

  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' ? {} : false }
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

startServer();
