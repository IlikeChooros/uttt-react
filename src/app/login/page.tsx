import * as React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import NextLink from 'next/link';
import ProTip from '@/components/ProTip';
import Copyright from '@/components/Copyright';
import Card from '@mui/material/Card';
import { Link } from '@mui/material';

export default function Login() {
  return (
    <Container>
        <Card>
          <Typography variant='h2'>
            Login
          </Typography>
          <Link href="/" color="secondary" component={NextLink}>
          Go to home
        </Link>
        </Card>
    </Container>
  );
}