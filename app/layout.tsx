import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Geo3D — Laboratório Interativo de Computação Gráfica',
  description: 'Plataforma acessível de avaliação e exploração geométrica 3D, planificações e sólidos para Computação Gráfica.',
  openGraph: {
    title: 'Geo3D — Laboratório Interativo de Computação Gráfica',
    description: 'Plataforma acessível de avaliação e exploração geométrica 3D, planificações e sólidos para Computação Gráfica.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Geo3D — Laboratório Interativo de Computação Gráfica',
    description: 'Plataforma acessível de avaliação e exploração geométrica 3D, planificações e sólidos para Computação Gráfica.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR" className="h-full bg-slate-50 text-slate-900 antialiased">
      <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
