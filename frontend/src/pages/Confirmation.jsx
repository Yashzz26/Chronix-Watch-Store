import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineCheckCircle } from 'react-icons/hi2';

export default function Confirmation() {
  const location = useLocation();
  const orderId = location.state?.orderId || 'NEW-ACQUISITION';

  return (
    <div className="container min-vh-100 d-flex flex-column align-items-center justify-content-center p-4 text-center mx-auto" style={{ maxWidth: 600 }}>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="text-gold mb-5"
        style={{ width: 100, height: 100 }}
      >
        <HiOutlineCheckCircle size="100%" />
      </motion.div>

      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="font-display display-3 text-t1 mb-4"
      >
        Welcome to the <br /> <span className="text-gold">Chronix Circle.</span>
      </motion.h1>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-5"
      >
        <p className="text-t2 fs-5 mb-5">Your reservation has been successfully accepted.</p>
        <div className="d-inline-block px-5 py-3 bg-s1 border border-border rounded-3 shadow-lg">
          <p className="text-[0.65rem] uppercase text-t3 tracking-widest mb-1">Reservation Reference</p>
          <p className="text-gold font-mono fw-bold h4 mb-0">{orderId}</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Link to="/" className="btn-chronix-ghost py-3 px-5 text-decoration-none">
          Keep Exploring
        </Link>
      </motion.div>
    </div>
  );
}
