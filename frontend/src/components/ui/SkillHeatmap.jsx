import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
const COLORS = ['#6272f1','#22d3ee','#f59e0b','#10b981','#a855f7','#ef4444','#f97316','#14b8a6'];
const DEMO = [
  {skill:'java',count:18},{skill:'python',count:15},{skill:'react',count:13},{skill:'javascript',count:12},
  {skill:'sql',count:10},{skill:'node.js',count:9},{skill:'machine learning',count:7},{skill:'aws',count:6},
  {skill:'docker',count:5},{skill:'typescript',count:4},
];
export default function SkillHeatmap({ data, loading }) {
  const items = data?.length > 0 ? data : DEMO;
  const max = Math.max(...items.map(d => d.count), 1);
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)' }}>
            <Flame size={15} style={{ color: '#ef4444' }} />
          </div>
          <div>
            <p className="section-title">Skill Heatmap</p>
            <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 1 }}>Most common skills across candidates</p>
          </div>
        </div>
        {!data?.length && <span className="badge" style={{ background: 'rgba(245,158,11,0.1)', color: 'var(--gold)' }}>Demo</span>}
      </div>
      {loading ? <div className="flex justify-center py-8"><div style={{ width:24,height:24,border:'2px solid var(--accent)',borderTopColor:'transparent',borderRadius:'50%',animation:'spin 0.8s linear infinite' }} /></div> : (
        <div className="space-y-2.5">
          {items.map((item, i) => {
            const color = COLORS[i % COLORS.length];
            const blocks = Math.max(1, Math.round((item.count / max) * 10));
            return (
              <motion.div key={item.skill} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                className="flex items-center gap-3">
                <span style={{ width: 20, fontSize: 10, color: 'var(--text3)', fontWeight: 700, textAlign: 'right', flexShrink: 0 }}>#{i+1}</span>
                <span style={{ width: 100, fontSize: 12, fontWeight: 600, color: 'var(--text)', textTransform: 'capitalize', flexShrink: 0 }}>{item.skill}</span>
                <div className="flex items-center gap-0.5 flex-1">
                  {Array.from({length:10}).map((_,j) => (
                    <motion.div key={j} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: i*0.03 + j*0.015 }}
                      style={{ flex: 1, height: 16, borderRadius: 3, background: j < blocks ? color : 'var(--border)', opacity: j < blocks ? (0.3 + (j/blocks)*0.7) : 1, transformOrigin: 'left' }} />
                  ))}
                </div>
                <span style={{ width: 28, fontSize: 12, fontWeight: 700, color, textAlign: 'center', flexShrink: 0 }}>{item.count}</span>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
