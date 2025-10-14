import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
export function HomePage() {
  const handleLogin = () => {
    window.location.href = '/api/auth/asana';
  };
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 overflow-hidden relative">
      <div className="absolute inset-0 w-full h-full bg-background bg-[radial-gradient(#4f46e533_1px,transparent_1px)] [background-size:32px_32px] dark:bg-[radial-gradient(#4f46e555_1px,transparent_1px)]"></div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-center space-y-6 relative z-10"
      >
        <div className="flex justify-center items-center gap-3">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4Z" fill="url(#paint0_linear_1_2)"/>
            <defs>
            <linearGradient id="paint0_linear_1_2" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop stopColor="#4F46E5"/>
            <stop offset="1" stopColor="#EC4899"/>
            </linearGradient>
            </defs>
          </svg>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tighter">Dashboard Asana</h1>
        </div>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Tu espacio de trabajo de Asana, transformado en un centro de comando claro y accionable.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto text-left text-muted-foreground">
            <div className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-primary" /> Análisis Potentes</div>
            <div className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-primary" /> Insights de Proyectos</div>
            <div className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-primary" /> Asistente IA de Chat</div>
            <div className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-primary" /> Visuales Impactantes</div>
        </div>
        <div className="pt-4">
          <Button
            size="lg"
            onClick={handleLogin}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-6 text-lg shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-1"
          >
            Conectar con Asana
          </Button>
        </div>
      </motion.div>
      <footer className="absolute bottom-8 text-center text-muted-foreground/80 text-sm">
        <p>By Ursall</p>
      </footer>
    </div>
  );
}