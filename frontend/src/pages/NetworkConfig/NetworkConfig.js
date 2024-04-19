import React, { useState } from 'react';
import { FormControl, RadioGroup, FormControlLabel, Radio, TextField, Button, Box, Typography } from '@mui/material';
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {

    margin: '0 auto',
    padding: theme.spacing(4),
    border: '1px solid #ccc',
    borderRadius: theme.spacing(2),
    
  },
  title: {
    marginBottom: theme.spacing(2),
    fontWeight: 'bold',
    fontSize: '1.5rem',
    color: theme.palette.primary.main,
    borderBottom: `2px solid ${theme.palette.primary.main}`,
    paddingBottom: theme.spacing(1),
  },
  textField: {
    marginBottom: theme.spacing(2),
  },
  button: {
    borderRadius: theme.spacing(2),
    padding: `${theme.spacing(1.5)}px ${theme.spacing(4)}px`,
    backgroundColor: theme.palette.primary.main,
    color: '#fff',
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
    marginTop: theme.spacing(2),
  },
}));

const NetworkConfig = ({ onConfig }) => {
  const classes = useStyles();
  const [interfaceName, setInterfaceName] = useState('eth0');
  const [dhcp, setDhcp] = useState(true);
  const [ip, setIp] = useState('');
  const [subnetMask, setSubnetMask] = useState('');
  const [gateway, setGateway] = useState('');

  const handleConfig = () => {
    const config = {
      interface: interfaceName,
      dhcp: dhcp,
      ip: dhcp ? '' : ip,
      prefix: dhcp ? '' : subnetMask,
      gateway: dhcp ? '' : gateway,
    };
    onConfig(config);
  };

  return (
    <Box className={classes.root}>
      <Typography variant="h2" className={classes.title}>
        Network Configuration
      </Typography>
      <TextField
        fullWidth
        label="Interface Name"
        variant="outlined"
        value={interfaceName}
        onChange={(e) => setInterfaceName(e.target.value)}
        className={classes.textField}
      />
      <FormControl component="fieldset">
        <RadioGroup
          row
          aria-label="configuration"
          name="configuration"
          value={dhcp ? 'dhcp' : 'manual'}
          onChange={(e) => setDhcp(e.target.value === 'dhcp')}
        >
          <FormControlLabel
            value="dhcp"
            control={<Radio color="primary" />}
            label="Automatic DHCP"
          />
          <FormControlLabel
            value="manual"
            control={<Radio color="primary" />}
            label="Manual Configuration"
          />
        </RadioGroup>
      </FormControl>
      {!dhcp && (
        <div>
          <TextField
            fullWidth
            label="IP Address"
            variant="outlined"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            className={classes.textField}
          />
          <TextField
            fullWidth
            label="Subnet Mask"
            variant="outlined"
            value={subnetMask}
            onChange={(e) => setSubnetMask(e.target.value)}
            className={classes.textField}
          />
          <TextField
            fullWidth
            label="Gateway"
            variant="outlined"
            value={gateway}
            onChange={(e) => setGateway(e.target.value)}
            className={classes.textField}
          />
        </div>
      )}
      <Button
        variant="contained"
        onClick={handleConfig}
        color="primary"
       
        className={classes.button}
      >
        Configure
      </Button>
    </Box>
  );
};

export default NetworkConfig;
