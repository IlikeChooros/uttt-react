import Copyright from "@/components/Copyright";
import UltimateTicTacToeGame from "@/components/game/UltimateTicTacToeGame";
import Box from "@mui/material/Box";

export default function Local() {
    return (
        <Box
      sx={{
        my: 4,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >        
      <Box sx={{ mb: 4, width: '100%' }}>
        <UltimateTicTacToeGame />
      </Box>
      <Copyright />
    </Box>
    )
}