import { Card, CardContent, Typography, Chip, Stack, Box } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { useSelector } from 'react-redux';

export default function BusinessInfoCard() {
  const { businessInfo } = useSelector((state) => state.transcription);

  if (!businessInfo) return null;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Extracted Business Information
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Brand Name
          </Typography>
          <Typography variant="body1">{businessInfo.brand_name || 'N/A'}</Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Business Description
          </Typography>
          <Typography variant="body2">{businessInfo.business_details || 'N/A'}</Typography>
        </Box>

        {businessInfo.recommended_services?.length > 0 && (
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Recommended Services
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {businessInfo.recommended_services.map((service, i) => (
                <Chip key={i} icon={<CheckCircle />} label={service} color="primary" />
              ))}
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}