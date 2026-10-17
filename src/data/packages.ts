export interface PackageMeta {
  name: string;
  category: 'Core & Shell' | 'Compilers & Runtimes' | 'Libraries' | 'Networking' | 'Termux Tools' | 'Development & CLI';
  description: string;
  version: string;
  size: string;
  dependencies: string[];
  license: string;
}

const RAW_PACKAGES = [
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

function categorize(name: string): PackageMeta['category'] {
  const n = name.toLowerCase();
  if (n.includes('lib') || n.includes('brotli') || n.includes('zlib') || n.includes('zstd') || n.includes('ssl') || n.includes('crypto') || n.includes('ffi') || n.includes('xml2')) {
    return 'Libraries';
  }
  if (n.includes('clang') || n.includes('llvm') || n.includes('golang') || n.includes('python') || n.includes('ruby') || n.includes('rust') || n.includes('php') || n.includes('openjdk') || n.includes('lua') || n.includes('composer') || n.includes('luarocks') || n.includes('gradle')) {
    return 'Compilers & Runtimes';
  }
  if (n.includes('termux') || n.includes('proot') || n.includes('vpn') || n.includes('command-not-found')) {
    return 'Termux Tools';
  }
  if (n.includes('curl') || n.includes('wget') || n.includes('ssh') || n.includes('inetutils') || n.includes('net-tools') || n.includes('socat')) {
    return 'Networking';
  }
  if (n.includes('git') || n.includes('gh') || n.includes('glab') || n.includes('npm') || n.includes('yarn') || n.includes('make') || n.includes('patch') || n.includes('pkg-config') || n.includes('railway')) {
    return 'Development & CLI';
  }
  return 'Core & Shell';
}

function getMockDescription(name: string): string {
  const descriptions: Record<string, string> = {
    bash: "The GNU Bourne-Again SHell, a widely-used command language interpreter.",
    git: "Fast, scalable, distributed revision control system with an unusually rich command set.",
    nodejs: "JavaScript runtime built on Chrome's V8 JavaScript engine for scalable network apps.",
    python: "High-level programming language for general-purpose programming, scripting, and AI.",
    rust: "Empowering everyone to build reliable and efficient software with memory safety.",
    curl: "Command line tool and library for transferring data with URLs.",
    wget: "Free software package for retrieving files using HTTP, HTTPS, FTP, and FTPS.",
    openssh: "Premier connectivity tool for remote login with SSH protocol.",
    vim: "Highly configurable text editor built to enable efficient text editing.",
    nano: "Small, free and friendly editor inspired by the Pico pine programmer editor.",
    clang: "C, C++, and Objective-C front-end for the LLVM compiler infrastructure.",
    golang: "Open source programming language that makes it easy to build simple, reliable software.",
    openjdk_21: "Open-source implementation of the Java Platform, Standard Edition 21.",
    ollama: "Get up and running with large language models locally on your device.",
    proot: "User-space implementation of chroot, mount --bind, and binfmt_misc."
  };
  return descriptions[name.toLowerCase()] || `Reliable Termux package for ${name.replace(/-/g, ' ')}, providing system integration and robust command-line capabilities.`;
}

export const PACKAGES_LIST: PackageMeta[] = RAW_PACKAGES.map((name, idx) => {
  const category = categorize(name);
  return {
    name,
    category,
    description: getMockDescription(name),
    version: `${(idx % 3) + 1}.${(idx * 7) % 10}.${(idx * 3) % 9}`,
    size: `${((idx * 37) % 85 + 1.2).toFixed(1)} MB`,
    dependencies: name.startsWith('lib') ? ['libc++', 'zlib'] : ['libandroid-support', 'ncurses'],
    license: idx % 2 === 0 ? 'MIT / Apache-2.0' : 'GPL-3.0'
  };
});
