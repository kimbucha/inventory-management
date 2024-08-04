'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Grid, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, CircularProgress, Box, TextField, Paper, Typography, Modal, Backdrop, Fade, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { deletePantryItem, fetchPantryItems } from '../lib/firebase';
import PantryForm from './PantryForm';
import { PantryItem } from '../lib/types';
import debounce from 'lodash/debounce';

const PantryList = () => {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<PantryItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<PantryItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const debouncedFetchItems = useMemo(
    () => debounce(async (query: string) => {
      setLoading(true);
      try {
        const results = await fetchPantryItems(query);
        setItems(results);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    debouncedFetchItems(searchQuery);
    return () => {
      debouncedFetchItems.cancel();
    };
  }, [searchQuery, debouncedFetchItems]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deletePantryItem(id);
      debouncedFetchItems(searchQuery);
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  }, [debouncedFetchItems, searchQuery]);

  const handleSubmit = useCallback(() => {
    setEditingItem(null);
    debouncedFetchItems(searchQuery);
  }, [debouncedFetchItems, searchQuery]);

  const handleItemClick = (item: PantryItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleEdit = () => {
    if (selectedItem) {
      setEditingItem(selectedItem);
    }
    setIsModalOpen(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={2}>
        {/* Sidebar: Inventory and Search Bar */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} style={{ padding: '20px', marginBottom: '20px' }}>
            <TextField
              label="Search"
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              fullWidth
              margin="normal"
            />
            <Typography variant="h6" gutterBottom>
              Inventory
            </Typography>
            {loading ? (
              <CircularProgress />
            ) : (
              <List>
                {items.map(item => (
                  <ListItem
                    key={item.id}
                    button
                    onClick={() => handleItemClick(item)}
                  >
                    <ListItemText primary={item.name} secondary={`Quantity: ${item.quantity}`} />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(item.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
        {/* Main Content: Add Item Form */}
        <Grid item xs={12} md={8}>
          <PantryForm initialData={editingItem} onSubmit={handleSubmit} onCancel={handleCancelEdit} />
        </Grid>
      </Grid>

      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={isModalOpen} timeout={0}>
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
          }}>
            <Typography variant="h6" gutterBottom>
              {selectedItem?.name}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Category: {selectedItem?.category}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Quantity: {selectedItem?.quantity}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Added Date: {selectedItem?.addedDate}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Expiry Date: {selectedItem?.expiryDate}
            </Typography>
            <Typography variant="body1" gutterBottom>
              User ID: {selectedItem?.userId}
            </Typography>
            <Box mt={2}>
              <Button
                variant="contained"
                fullWidth
                sx={{
                  backgroundColor: 'white',
                  color: 'black',
                  '&:hover': {
                    backgroundColor: 'lightgray',
                  },
                }}
                onClick={handleEdit}
              >
                Edit
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export default PantryList;
