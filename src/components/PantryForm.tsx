import React, { useState, useCallback, useEffect } from 'react';
import { TextField, Button, Box, Paper, Typography } from '@mui/material';
import { addPantryItem, updatePantryItem } from '../lib/firebase';
import { PantryItem } from '../lib/types';

const PantryForm = ({ initialData, onSubmit, onCancel }: { initialData?: PantryItem | null, onSubmit: () => void, onCancel: () => void }) => {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [category, setCategory] = useState('');
  const [userId, setUserId] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setQuantity(initialData.quantity);
      setExpiryDate(new Date(initialData.expiryDate).toISOString().split('T')[0]);
      setCategory(initialData.category);
      setUserId(initialData.userId);
    }
  }, [initialData]);

  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    const item = {
      name,
      quantity,
      expiryDate: new Date(expiryDate).toISOString(),
      category,
      addedDate: new Date().toISOString(),
      userId
    };
    if (initialData) {
      await updatePantryItem(initialData.id, item);
    } else {
      await addPantryItem(item);
    }
    onSubmit();
    setName('');
    setQuantity(1);
    setExpiryDate('');
    setCategory('');
    setUserId('');
  }, [name, quantity, expiryDate, category, userId, initialData, onSubmit]);

  const handleCancel = () => {
    setName('');
    setQuantity(1);
    setExpiryDate('');
    setCategory('');
    setUserId('');
    onCancel();
  };

  return (
    <Paper elevation={3} style={{ padding: '20px', marginBottom: '20px' }}>
      <Typography variant="h6" gutterBottom>
        {initialData ? 'Update Item' : 'Add Item'}
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Item Name"
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          required
          margin="normal"
        />
        <TextField
          label="Category"
          variant="outlined"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          fullWidth
          required
          margin="normal"
        />
        <TextField
          label="Quantity"
          type="number"
          variant="outlined"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          fullWidth
          required
          margin="normal"
        />
        <TextField
          label="Expiry Date"
          type="date"
          variant="outlined"
          value={expiryDate}
          onChange={(e) => setExpiryDate(e.target.value)}
          fullWidth
          required
          margin="normal"
          InputLabelProps={{
            shrink: true,
          }}
        />
        <TextField
          label="User ID"
          variant="outlined"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          fullWidth
          required
          margin="normal"
        />
        <Box mt={2} display="flex" justifyContent="space-between">
          <Button
            type="submit"
            variant="contained"
            sx={{
              backgroundColor: 'white',
              color: 'black',
              '&:hover': {
                backgroundColor: 'lightgray',
              },
              marginRight: 1,
            }}
          >
            {initialData ? 'Update Item' : 'Add Item'}
          </Button>
          {initialData && (
            <Button
              variant="contained"
              sx={{
                backgroundColor: 'white',
                color: 'black',
                '&:hover': {
                  backgroundColor: 'lightgray',
                },
              }}
              onClick={handleCancel}
            >
              Cancel
            </Button>
          )}
        </Box>
      </form>
    </Paper>
  );
};

export default React.memo(PantryForm);
