import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import PropTypes from 'prop-types';
import { Box, Divider, MenuItem, MenuList, Popover, Typography } from '@mui/material';
import { useAuth } from 'src/hooks/use-auth';

export const StockActionPopover = (props) => {
    const { anchorEl, onClose, open, handleOnMemo } = props;
    const router = useRouter();
    const auth = useAuth();



    return (
        <Popover
            anchorEl={anchorEl}
            anchorOrigin={{
                horizontal: 'left',
                vertical: 'bottom'
            }}
            onClose={onClose}
            open={open}
            PaperProps={{ sx: { width: 200 } }}
        >
            <Box
                sx={{
                    py: 1.5,
                    px: 2
                }}
            >
                <Typography variant="overline">
                    Select Any Option
                </Typography>

            </Box>
            <Divider />
            <MenuList
                disablePadding
                dense
                sx={{
                    p: '8px',
                    '& > *': {
                        borderRadius: 1
                    }
                }}
            >
                <MenuItem onClick={handleOnMemo}>
                    Memo
                </MenuItem>
                <MenuItem onClick={handleOnMemo}>
                    Return From Memo
                </MenuItem>
            </MenuList>
        </Popover>
    );
};

StockActionPopover.propTypes = {
    anchorEl: PropTypes.any,
    onClose: PropTypes.func,
    open: PropTypes.bool.isRequired
};
