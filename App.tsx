import React from 'react';
import Calculator from './components/Calculator';

function App() {
  return (
    <div className="min-h-screen bg-[#F3F4F6] text-gray-900 font-sans selection:bg-gray-900 selection:text-white">
      <nav className="bg-black border-b border-gray-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center gap-1">
                {/* Logo GPS Icon (Asterisk/Star style based on brand book) */}
                <svg className="h-8 w-auto text-white fill-current" viewBox="0 0 52 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Simplificação geométrica do logo GPS */}
                  <path d="M26 0L32 18H52L36 30L42 48L26 36L10 48L16 30L0 18H20L26 0Z" fill="white" style={{display:'none'}}/> 
                  <path d="M26 4V44M10 14L42 34M42 14L10 34" stroke="white" strokeWidth="8" strokeLinecap="square" />
                </svg>
                <span className="font-bold text-2xl tracking-tighter text-white ml-2 lowercase">gps</span>
                <span className="font-light text-2xl tracking-tighter text-gray-400 lowercase">.calc</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <a href="#" className="hidden sm:block text-sm font-medium text-gray-300 hover:text-white transition-colors">Método GPS</a>
              <button className="bg-white text-black px-5 py-2.5 rounded-none text-sm font-bold hover:bg-gray-200 transition-colors uppercase tracking-wide">
                Exportar Relatório
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <Calculator />
      </main>
      
      <footer className="bg-white border-t border-gray-200 mt-12 py-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center text-center">
          <div className="mb-4">
             <span className="font-bold text-xl tracking-tighter text-black lowercase">gps</span>
          </div>
          <p className="text-gray-500 text-sm max-w-md">
            &copy; {new Date().getFullYear()} Kennyd Willker. O amanhã não se adivinha, se constrói.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;