import { Outlet } from 'react-router-dom';

export default function App() {
  console.log('App component rendering...');

  return (
    <div style={{ minHeight: '100vh' }}>
      <Outlet />
    </div>
  );
}

