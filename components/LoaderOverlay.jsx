import { Box } from '@mui/material';

const LoaderOverlay = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: '120px',
          height: '120px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Spinning golden border */}
        <Box
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            border: '4px solid transparent',
            borderTopColor: '#D4AF37',
            borderRightColor: '#FFD700',
            animation: 'spin 1s linear infinite',
            '@keyframes spin': {
              '0%': { transform: 'rotate(0deg)' },
              '100%': { transform: 'rotate(360deg)' },
            },
          }}
        />

        {/* Static logo */}
        <Box
          component="img"
          src="/download.jpg"
          alt="Loading"
          sx={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            objectFit: 'contain',
            background: '#000',
            padding: '10px',
            zIndex: 1,
          }}
        />
      </Box>
    </Box>
  );
};

export default LoaderOverlay;