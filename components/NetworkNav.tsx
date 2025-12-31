import React from 'react';
import { Icons } from './Icons';
import { NodeStats } from '../types';

interface NetworkNavProps {
    nodes: NodeStats[];
    selectedNode: NodeStats;
    onNodeChange: (node: NodeStats) => void;
}

const statusColors: Record<string, { bg: string; text: string; border: string }> = {
    nominal: { bg: 'bg-success/10', text: 'text-success', border: 'border-success/30' },
    warning: { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/30' },
    critical: { bg: 'bg-error/10', text: 'text-error', border: 'border-error/30' },
    offline: { bg: 'bg-gray-500/10', text: 'text-gray-500', border: 'border-gray-500/30' }
};

export const NetworkNav: React.FC<NetworkNavProps> = ({
    nodes,
    selectedNode,
    onNodeChange
}) => {
    const [isOpen, setIsOpen] = React.useState(false);

    const statusColor = statusColors[selectedNode.status];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="glass-panel px-4 py-2 rounded-lg border border-white/10 hover:border-primary/30 transition-all flex items-center gap-3 min-w-[240px]"
            >
                <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center text-primary border border-primary/50">
                    <Icons.Server size={18} />
                </div>
                <div className="flex-1 text-left">
                    <div className="text-xs text-gray-400">Grid Network</div>
                    <div className="text-sm font-semibold text-white">{selectedNode.name}</div>
                </div>
                <div className={`w-2 h-2 rounded-full ${statusColor.bg.replace('/10', '')} animate-pulse`} />
                <Icons.ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full mt-2 left-0 right-0 bg-[#121213] border border-white/10 rounded-lg shadow-xl z-[100] overflow-hidden">
                        {/* Header */}
                        <div className="p-3 border-b border-white/10">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-gray-400">NETWORK NODES</span>
                                <span className="text-xs text-primary font-mono">{nodes.length} Nodes</span>
                            </div>
                        </div>

                        {/* Node List */}
                        <div className="max-h-[400px] overflow-y-auto">
                            {nodes.map(node => {
                                const nodeStatusColor = statusColors[node.status];
                                return (
                                    <button
                                        key={node.id}
                                        onClick={() => {
                                            onNodeChange(node);
                                            setIsOpen(false);
                                        }}
                                        className={`w-full px-3 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 ${selectedNode.id === node.id ? 'bg-primary/10' : ''
                                            }`}
                                    >
                                        <div className={`w-10 h-10 rounded flex items-center justify-center ${nodeStatusColor.bg} border ${nodeStatusColor.border}`}>
                                            <Icons.Server size={20} className={nodeStatusColor.text} />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <div className="text-sm font-semibold text-white">{node.name}</div>
                                            <div className="text-xs text-gray-500">{node.zone}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-mono text-gray-400">Health: {node.health}%</div>
                                        </div>
                                        <div className={`w-2 h-2 rounded-full ${nodeStatusColor.bg.replace('/10', '')} animate-pulse`} />
                                    </button>
                                );
                            })}
                        </div>

                        {/* Footer */}
                        <div className="p-3 border-t border-white/10 bg-black/20">
                            <div className="flex items-center gap-4 text-xs">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-success" />
                                    <span className="text-gray-400">Nominal</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-warning" />
                                    <span className="text-gray-400">Warning</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-error" />
                                    <span className="text-gray-400">Critical</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
