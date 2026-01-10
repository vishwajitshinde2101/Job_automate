import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Download, Apple, MonitorPlay, CheckCircle2, HelpCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Downloads: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Download AutoJobzy - Desktop App for Mac & Windows</title>
        <meta name="description" content="Download AutoJobzy desktop application for macOS (M1/M2/M3 & Intel) and Windows. Free job automation tool." />
      </Helmet>

      <main className="min-h-screen bg-gradient-to-b from-dark-900 via-black to-dark-900 pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-6">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-green"></span>
              </span>
              <span className="text-sm font-medium text-gray-300">Version 1.0.0 - Latest Release</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-heading font-bold text-white mb-4">
              Download <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple">AutoJobzy</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Choose the right version for your operating system
            </p>
          </motion.div>

          {/* macOS Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 flex items-center justify-center">
                <Apple className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">For macOS</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* M1/M2/M3 Version */}
              <div className="group relative bg-gradient-to-br from-dark-800 to-dark-900 rounded-2xl p-8 border-2 border-neon-blue/30 hover:border-neon-blue/60 transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-neon-blue/10 rounded-full blur-3xl"></div>

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">Apple Silicon</h3>
                      <p className="text-gray-400 text-sm">For NEW Macs (M1/M2/M3/M4)</p>
                    </div>
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full">RECOMMENDED</span>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-gray-300">
                      <CheckCircle2 className="w-4 h-4 text-neon-green" />
                      <span className="text-sm">macOS 10.15 or later</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <CheckCircle2 className="w-4 h-4 text-neon-green" />
                      <span className="text-sm">132 MB Download</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <CheckCircle2 className="w-4 h-4 text-neon-green" />
                      <span className="text-sm">Optimized for Apple Chip</span>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4 mb-6">
                    <code className="text-neon-blue text-sm font-mono break-all">
                      AutoJobzy-1.0.0-arm64.dmg
                    </code>
                  </div>

                  <a
                    href="https://autojobzy-desktop-downloads.s3.eu-north-1.amazonaws.com/arm64/AutoJobzy-1.0.0-arm64.dmg"
                    className="group/btn flex items-center justify-center gap-2 w-full bg-gradient-to-r from-neon-blue to-neon-purple text-white font-bold py-4 rounded-xl hover:shadow-[0_0_30px_rgba(0,243,255,0.6)] transition-all duration-300 relative overflow-hidden"
                    download
                  >
                    <div className="absolute inset-0 bg-white opacity-0 group-hover/btn:opacity-10 transition-opacity"></div>
                    <Download className="w-5 h-5 group-hover/btn:animate-bounce" />
                    <span>Download for M1/M2/M3</span>
                    <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>

              {/* Intel Version */}
              <div className="group relative bg-gradient-to-br from-dark-800 to-dark-900 rounded-2xl p-8 border-2 border-gray-700 hover:border-neon-purple/60 transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-neon-purple/10 rounded-full blur-3xl"></div>

                <div className="relative z-10">
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold text-white mb-2">Intel Processor</h3>
                    <p className="text-gray-400 text-sm">For OLD Macs (2019 & earlier)</p>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-gray-300">
                      <CheckCircle2 className="w-4 h-4 text-neon-green" />
                      <span className="text-sm">macOS 10.15 or later</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <CheckCircle2 className="w-4 h-4 text-neon-green" />
                      <span className="text-sm">137 MB Download</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <CheckCircle2 className="w-4 h-4 text-neon-green" />
                      <span className="text-sm">Intel x64 Compatible</span>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4 mb-6">
                    <code className="text-neon-purple text-sm font-mono break-all">
                      AutoJobzy-1.0.0-x64.dmg
                    </code>
                  </div>

                  <a
                    href="#"
                    className="group/btn flex items-center justify-center gap-2 w-full bg-gradient-to-r from-neon-purple to-pink-500 text-white font-bold py-4 rounded-xl hover:shadow-[0_0_30px_rgba(188,19,254,0.6)] transition-all duration-300 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white opacity-0 group-hover/btn:opacity-10 transition-opacity"></div>
                    <Download className="w-5 h-5 group-hover/btn:animate-bounce" />
                    <span>Download for Intel Mac</span>
                    <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            </div>

            {/* Mac Help Box */}
            <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <HelpCircle className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-white font-bold mb-2">How to check your Mac type?</h4>
                  <p className="text-gray-300 text-sm mb-2">
                    <strong>Apple Menu</strong> → <strong>About This Mac</strong>
                  </p>
                  <ul className="text-gray-400 text-sm space-y-1">
                    <li>• Look for <span className="text-neon-blue font-semibold">"Chip: Apple M1/M2/M3"</span> → Use ARM64 version</li>
                    <li>• Look for <span className="text-neon-purple font-semibold">"Processor: Intel"</span> → Use x64 version</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Windows Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                <MonitorPlay className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">For Windows</h2>
            </div>

            <div className="group relative bg-gradient-to-br from-dark-800 to-dark-900 rounded-2xl p-8 border-2 border-cyan-500/30 hover:border-cyan-500/60 transition-all duration-300 overflow-hidden max-w-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl"></div>

              <div className="relative z-10">
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-white mb-2">Windows Desktop</h3>
                  <p className="text-gray-400 text-sm">For Windows 10/11 (64-bit)</p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-neon-green" />
                    <span className="text-sm">Windows 10 or later required</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-neon-green" />
                    <span className="text-sm">145 MB Download (ZIP file)</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-neon-green" />
                    <span className="text-sm">Extract & Run AutoJobzy.exe</span>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-4 mb-6">
                  <code className="text-cyan-400 text-sm font-mono break-all">
                    AutoJobzy-1.0.0.zip
                  </code>
                </div>

                <a
                  href="#"
                  className="group/btn flex items-center justify-center gap-2 w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-4 rounded-xl hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white opacity-0 group-hover/btn:opacity-10 transition-opacity"></div>
                  <Download className="w-5 h-5 group-hover/btn:animate-bounce" />
                  <span>Download for Windows</span>
                  <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          </motion.section>

          {/* Installation Guide */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="grid md:grid-cols-2 gap-6"
          >
            {/* macOS Installation */}
            <div className="bg-dark-800 rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Apple className="w-6 h-6 text-neon-blue" />
                macOS Installation
              </h3>
              <ol className="space-y-3 text-gray-300 text-sm">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-neon-blue/20 text-neon-blue flex items-center justify-center font-bold">1</span>
                  <span>Double-click the <code className="text-neon-blue">.dmg</code> file</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-neon-blue/20 text-neon-blue flex items-center justify-center font-bold">2</span>
                  <span>Drag AutoJobzy to Applications folder</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-neon-blue/20 text-neon-blue flex items-center justify-center font-bold">3</span>
                  <span>Right-click app → Open (first time only)</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-neon-blue/20 text-neon-blue flex items-center justify-center font-bold">4</span>
                  <span>Allow security permission if asked</span>
                </li>
              </ol>
            </div>

            {/* Windows Installation */}
            <div className="bg-dark-800 rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <MonitorPlay className="w-6 h-6 text-cyan-400" />
                Windows Installation
              </h3>
              <ol className="space-y-3 text-gray-300 text-sm">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">1</span>
                  <span>Right-click <code className="text-cyan-400">AutoJobzy-1.0.0.zip</code></span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">2</span>
                  <span>Select "Extract All"</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">3</span>
                  <span>Open extracted folder</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">4</span>
                  <span>Run <code className="text-cyan-400">AutoJobzy.exe</code></span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">5</span>
                  <span>Allow firewall permission if asked</span>
                </li>
              </ol>
            </div>
          </motion.section>

          {/* Features Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-12 bg-gradient-to-r from-neon-blue/10 to-neon-purple/10 rounded-2xl p-8 border border-white/10"
          >
            <h3 className="text-2xl font-bold text-white mb-6 text-center">What's Included in All Versions</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-neon-green flex-shrink-0" />
                <div>
                  <h4 className="text-white font-semibold mb-1">Job Automation</h4>
                  <p className="text-gray-400 text-sm">Auto-apply to Naukri jobs</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-neon-green flex-shrink-0" />
                <div>
                  <h4 className="text-white font-semibold mb-1">Resume Upload</h4>
                  <p className="text-gray-400 text-sm">Cloud storage (S3)</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-neon-green flex-shrink-0" />
                <div>
                  <h4 className="text-white font-semibold mb-1">Payment Integration</h4>
                  <p className="text-gray-400 text-sm">Razorpay secure payments</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-neon-green flex-shrink-0" />
                <div>
                  <h4 className="text-white font-semibold mb-1">MySQL Database</h4>
                  <p className="text-gray-400 text-sm">Reliable data storage</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-neon-green flex-shrink-0" />
                <div>
                  <h4 className="text-white font-semibold mb-1">Modern UI</h4>
                  <p className="text-gray-400 text-sm">Beautiful purple theme</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-neon-green flex-shrink-0" />
                <div>
                  <h4 className="text-white font-semibold mb-1">All Features</h4>
                  <p className="text-gray-400 text-sm">Fully functional app</p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Footer Info */}
          <div className="mt-12 text-center text-gray-500 text-sm">
            <p>Built on: 10 January 2026 • Version: 1.0.0</p>
            <p className="mt-2">Copyright © 2026 AutoJobzy. All rights reserved.</p>
          </div>
        </div>
      </main>
    </>
  );
};

export default Downloads;
