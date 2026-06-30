import { Box, useMediaQuery, useTheme } from '@mui/material';

const LoaderOverlay = ({ isLoading }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (!isLoading) return null;

  const size = isMobile ? '64px' : '120px';
  const logoSize = isMobile ? '44px' : '80px';
  const borderThickness = isMobile ? '3px' : '4px';
  const paddingSize = isMobile ? '5px' : '10px';

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
          width: size,
          height: size,
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
            border: `${borderThickness} solid transparent`,
            borderTopColor: '#f3a833',
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
            width: logoSize,
            height: logoSize,
            borderRadius: '50%',
            objectFit: 'contain',
            background: '#000',
            padding: paddingSize,
            zIndex: 1,
          }}
        />
      </Box>
    </Box>
  );
};

export default LoaderOverlay;