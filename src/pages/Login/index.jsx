import React, { useState } from 'react'
import { Eye, EyeOff, Lock, LogIn } from 'lucide-react'

function Login({setSession}) {
    const [visiblePassword, setVisiblePassword] = useState(false);
    const [password, setPassword] = useState("");
    const [error, setError] = useState(false);
    
    const handleLogin = () => {
        if(password === 'Seguridad@2025'){
            setSession(true);
            sessionStorage.setItem("dashboard_session", true);
            console.log("login existoso")
        }
        else{
            console.log("contraseña incorrecta")
            setError(true);
            setTimeout(() => setError(false), 3000);
        }
    }

    const handleKeyPress = (e) => {
        if(e.key === 'Enter') {
            handleLogin();
        }
    }

    return (
        <div className='min-h-screen bg-gray-100 flex items-center justify-center p-4'>
            <div className='w-full max-w-md'>
                {/* Main Login Card */}
                <div className='bg-white rounded-lg shadow-sm border border-gray-200/80 overflow-hidden'>
                    {/* Header */}
                    <div className='px-6 py-8 border-b border-gray-100 text-center'>
                        <div className='inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg mb-4'>
                            <Lock className='w-6 h-6 text-gray-600' />
                        </div>
                        <h1 className='text-lg font-medium text-gray-900 mb-1'>Dashboard Usuarios</h1>
                        <p className='text-xs text-gray-600'>Sistema de analíticas - Datastics</p>
                    </div>
                    
                    {/* Form Container */}
                    <div className='p-6'>
                        <div className='mb-6'>
                            <h2 className='text-base font-medium text-gray-900 mb-1'>Bienvenido</h2>
                            <p className='text-xs text-gray-600'>Ingresa tu contraseña para continuar</p>
                        </div>
                        
                        {/* Password Input */}
                        <div className='mb-6'>
                            <label className='block text-xs font-medium text-gray-700 mb-2'>
                                Contraseña
                            </label>
                            <div className='relative'>
                                <input 
                                    type={visiblePassword ? "text" : "password"} 
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setError(false);
                                    }}
                                    onKeyPress={handleKeyPress}
                                    className={`w-full px-3 py-2 pr-10 text-xs border rounded-md focus:outline-none focus:ring-1 transition-colors ${
                                        error 
                                            ? 'border-red-300 bg-red-50 focus:ring-red-400 focus:border-red-400' 
                                            : 'border-gray-200 focus:ring-gray-400 focus:border-gray-400'
                                    }`}
                                    placeholder='Ingresa tu contraseña'
                                />
                                <button
                                    type='button'
                                    onClick={() => setVisiblePassword(prev => !prev)}
                                    className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors'
                                >
                                    {visiblePassword ? (
                                        <EyeOff className='w-4 h-4' />
                                    ) : (
                                        <Eye className='w-4 h-4' />
                                    )}
                                </button>
                            </div>
                            
                            {/* Error Message */}
                            {error && (
                                <div className='mt-2 text-xs text-red-600 flex items-center gap-1'>
                                    <span>Contraseña incorrecta</span>
                                </div>
                            )}
                        </div>
                        
                        {/* Login Button */}
                        <button 
                            onClick={handleLogin}
                            className='w-full bg-gray-900 text-white py-2.5 px-4 rounded-md text-xs font-medium 
                                     hover:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-400 
                                     transition-colors flex items-center justify-center gap-2'
                        >
                            <LogIn className='w-4 h-4' />
                            Iniciar Sesión
                        </button>
                        
                        {/* Footer */}
                        <div className='mt-6 text-center'>
                            <p className='text-xs text-gray-500'>
                                Sistema seguro de Datastics
                            </p>
                        </div>
                    </div>
                </div>
                
                {/* Bottom decoration */}
                <div className='mt-6 text-center'>
                    <div className='flex items-center justify-center gap-1'>
                        <div className='w-6 h-0.5 bg-gray-300 rounded-full'></div>
                        <div className='w-1 h-1 bg-gray-400 rounded-full'></div>
                        <div className='w-1 h-1 bg-gray-400 rounded-full'></div>
                        <div className='w-6 h-0.5 bg-gray-300 rounded-full'></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login