// src/components/LoginButton.tsx
const LoginButton = () => {
  const handleLogin = () => {
    window.location.href = '/oauth/login/github';
  };

  return <button onClick={handleLogin}>Iniciar sesión con GitHub</button>;
};

export default LoginButton;
