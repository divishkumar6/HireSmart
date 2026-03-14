import { motion } from 'framer-motion';
export default function StatCard({ icon: Icon, label, value, color = '#5b6ef5', delay = 0 }) {
  return (
    <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay, duration:0.3 }}
      className="stat-card">
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
        <div>
          <p style={{ fontSize:10.5, fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.7px', marginBottom:8 }}>{label}</p>
          <p style={{ fontSize:26, fontFamily:'Syne', fontWeight:700, color:'var(--text)', lineHeight:1 }}>{value}</p>
        </div>
        <div style={{ width:38, height:38, borderRadius:9, background:color+'16', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Icon size={17} style={{ color }} />
        </div>
      </div>
    </motion.div>
  );
}
