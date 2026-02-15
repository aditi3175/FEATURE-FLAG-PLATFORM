import React, { useState, useEffect } from 'react';
import { Command } from 'cmdk';
import { Search, Flag, BarChart, Settings, Code } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ProjectAPI } from '../services/api';

export const CommandBar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  useEffect(() => {
    if (open) {
      ProjectAPI.getProjects()
        .then(setProjects)
        .catch(console.error);
    }
  }, [open]);

  const handleSelect = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Command Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-xl z-[101]"
          >
            <Command className="glass-surface rounded-xl shadow-2xl overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
                <Search className="w-4 h-4 text-gray-400" strokeWidth={2} />
                <Command.Input
                  placeholder="Search or jump to..."
                  className="flex-1 bg-transparent outline-none text-sm placeholder-gray-500 text-white"
                />
                <div className="text-xs text-gray-500 px-2 py-1 rounded bg-white/5 border border-white/5">
                  ESC
                </div>
              </div>

              <Command.List className="max-h-[400px] overflow-y-auto p-2">
                <Command.Empty className="p-4 text-center text-sm text-gray-500">
                  No results found.
                </Command.Empty>

                {projects.length > 0 && (
                  <Command.Group heading="Projects" className="text-xs text-gray-500 px-2 py-1.5 font-medium">
                    {projects.map((project) => (
                      <Command.Item
                        key={project.id}
                        onSelect={() => handleSelect(`/app/projects/${project.id}`)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-white/5 text-sm text-white mb-0.5"
                      >
                        <div className="w-4 h-4 rounded-full bg-gradient-to-br from-amber-400/20 to-amber-600/20 border border-amber-500/30 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        </div>
                        <span>{project.name}</span>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}

                <Command.Group heading="Pages" className="text-xs text-gray-500 px-2 py-1.5 font-medium">
                  <Command.Item
                    onSelect={() => handleSelect('/app/dashboard')}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-white/5 text-sm text-white mb-0.5"
                  >
                    <Flag className="w-4 h-4 text-gray-400" strokeWidth={2} />
                    <span>Projects</span>
                  </Command.Item>

                  <Command.Item
                    onSelect={() => handleSelect('/app/analytics')}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-white/5 text-sm text-white mb-0.5"
                  >
                    <BarChart className="w-4 h-4 text-gray-400" strokeWidth={2} />
                    <span>Analytics</span>
                  </Command.Item>

                  <Command.Item
                    onSelect={() => handleSelect('/app/sdk')}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-white/5 text-sm text-white mb-0.5"
                  >
                    <Code className="w-4 h-4 text-gray-400" strokeWidth={2} />
                    <span>SDK Setup</span>
                  </Command.Item>

                  <Command.Item
                    onSelect={() => handleSelect('/app/settings')}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-white/5 text-sm text-white mb-0.5"
                  >
                    <Settings className="w-4 h-4 text-gray-400" strokeWidth={2} />
                    <span>Settings</span>
                  </Command.Item>
                </Command.Group>
              </Command.List>

              <div className="flex items-center justify-between px-4 py-2 border-t border-white/5 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5">↑↓</kbd>
                  <span>Navigate</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5">↵</kbd>
                  <span>Select</span>
                </div>
              </div>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CommandBar;
