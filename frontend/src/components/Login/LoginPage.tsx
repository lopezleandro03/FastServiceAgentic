import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ login: loginInput, password });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">FastService</h1>
          <p className="mt-2 text-sm text-white/70">Inicia sesión para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="login" className="text-sm font-medium text-white/90">
              Email o Usuario
            </label>
            <Input
              id="login"
              type="text"
              value={loginInput}
              onChange={(e) => setLoginInput(e.target.value)}
              placeholder="Ingresa tu email o usuario"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-indigo-400 focus:ring-indigo-400"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-white/90">
              Contraseña
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-indigo-400 focus:ring-indigo-400"
              required
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="p-3 text-sm text-red-300 bg-red-500/20 rounded-lg border border-red-500/30">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white font-semibold py-2.5"
          >
            {isLoading ? 'Ingresando...' : 'Ingresar'}
          </Button>
        </form>

        <div className="text-center text-xs text-white/50">
          © 2026 FastService - Todos los derechos reservados
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
