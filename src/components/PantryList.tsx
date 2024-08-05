'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  CircularProgress,
  Box,
  TextField,
  Paper,
  Typography,
  Modal,
  Backdrop,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { deletePantryItem, fetchPantryItems, updatePantryItem } from '../lib/firebase';
import PantryForm from './PantryForm';
import { PantryItem } from '../lib/types';
import debounce from 'lodash/debounce';
import toast, { Toaster } from 'react-hot-toast';

type SortBy = 'none' | 'category' | 'expiryDate' | 'addedDate' | 'userId';

const capitalize = (str: string) => {
  return str.replace(/\b\w/g, char => char.toUpperCase());
};

const PantryList = () => {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<PantryItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<PantryItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>('none');

  const fetchItems = async (searchQuery: string) => {
    setLoading(true);
    try {
      const results = await fetchPantryItems(''); // Fetch all items
      const lowerCaseQuery = searchQuery.toLowerCase();

      const filteredResults = results.filter((item) => {
        if (!searchQuery) return true; // Show all items if search query is empty

        const nameMatch = item.name.toLowerCase().includes(lowerCaseQuery);
        const categoryMatch = lowerCaseQuery.length >= item.category.length / 2 && item.category.toLowerCase().includes(lowerCaseQuery);
        const userIdMatch = lowerCaseQuery.length >= item.userId.length / 2 && item.userId.toLowerCase().includes(lowerCaseQuery);
        return nameMatch || categoryMatch || userIdMatch;
      });

      const sortedResults = filteredResults.sort((a, b) => {
        switch (sortBy) {
          case 'category':
            return a.category.localeCompare(b.category);
          case 'expiryDate':
            return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
          case 'addedDate':
            return new Date(a.addedDate).getTime() - new Date(b.addedDate).getTime();
          case 'userId':
            return a.userId.localeCompare(b.userId);
          case 'none':
          default:
            return a.name.localeCompare(b.name);
        }
      });

      setItems(sortedResults);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetchItems = useMemo(() => debounce(fetchItems, 300), [sortBy]);

  useEffect(() => {
    debouncedFetchItems(searchQuery);
    return () => {
      debouncedFetchItems.cancel();
    };
  }, [searchQuery, sortBy, debouncedFetchItems]);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        const itemToDelete = items.find(item => item.id === id);
        if (itemToDelete) {
          if (itemToDelete.quantity > 1) {
            await updatePantryItem(id, { 
              quantity: itemToDelete.quantity - 1, 
              expiryDate: itemToDelete.expiryDate, 
              category: itemToDelete.category,
              name: itemToDelete.name,
              addedDate: itemToDelete.addedDate,
              userId: itemToDelete.userId
            });
            toast.success('Item quantity decremented by 1.');
          } else {
            await deletePantryItem(id);
            toast.success('Item removed successfully!');
          }
          debouncedFetchItems(searchQuery);
        }
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    },
    [debouncedFetchItems, items, searchQuery]
  );

  const handleSubmit = useCallback(() => {
    setEditingItem(null);
    debouncedFetchItems(searchQuery);
    toast.success('Item added successfully!', { id: 'add-toast' });
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

  const getSearchFieldDisplay = (item: PantryItem, query: string, sortBy: SortBy) => {
    const lowerCaseQuery = query.toLowerCase();
    if (!query) {
      switch (sortBy) {
        case 'category':
          return `Category: ${capitalize(item.category)}`;
        case 'expiryDate':
          return `Expiry Date: ${item.expiryDate}`;
        case 'addedDate':
          return `Added Date: ${item.addedDate}`;
        case 'userId':
          return `User ID: ${item.userId}`;
        case 'none':
        default:
          return `Quantity: ${item.quantity}`;
      }
    }
    if (item.name.toLowerCase().includes(lowerCaseQuery)) {
      return `Quantity: ${item.quantity}`;
    }
    if (item.category.toLowerCase().includes(lowerCaseQuery) && lowerCaseQuery.length >= item.category.length / 2) {
      return `Category: ${capitalize(item.category)}`;
    }
    if (item.userId.toLowerCase().includes(lowerCaseQuery) && lowerCaseQuery.length >= item.userId.length / 2) {
      return `User ID: ${item.userId}`;
    }
    return `Quantity: ${item.quantity}`;
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Toaster />
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
              placeholder="Search by name, category, or user ID"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                label="Sort By"
              >
                <MenuItem value="none">None</MenuItem>
                <MenuItem value="category">Category</MenuItem>
                <MenuItem value="expiryDate">Expiry Date</MenuItem>
                <MenuItem value="addedDate">Date Added</MenuItem>
                <MenuItem value="userId">User ID</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="h6" gutterBottom>
              Inventory
            </Typography>
            {loading ? (
              <CircularProgress />
            ) : (
              <List>
                {items.map((item) => (
                  <ListItem key={item.id} button onClick={() => handleItemClick(item)}>
                    <ListItemText
                      primary={capitalize(item.name)}
                      secondary={getSearchFieldDisplay(item, searchQuery, sortBy)}
                    />
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
          timeout: 300, // Optional: Keep a short backdrop transition for a better UX
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Box>
            <Typography variant="h5" gutterBottom>
              {capitalize(selectedItem?.name || '')}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body1" gutterBottom>
                <strong>Category:</strong>
              </Typography>
              <Typography variant="body1" gutterBottom>
                {capitalize(selectedItem?.category || '')}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body1" gutterBottom>
                <strong>Quantity:</strong>
              </Typography>
              <Typography variant="body1" gutterBottom>
                {selectedItem?.quantity}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body1" gutterBottom>
                <strong>Added Date:</strong>
              </Typography>
              <Typography variant="body1" gutterBottom>
                {selectedItem?.addedDate}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body1" gutterBottom>
                <strong>Expiry Date:</strong>
              </Typography>
              <Typography variant="body1" gutterBottom>
                {selectedItem?.expiryDate}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body1" gutterBottom>
                <strong>User ID:</strong>
              </Typography>
              <Typography variant="body1" gutterBottom>
                {capitalize(selectedItem?.userId || '')}
              </Typography>
            </Box>
            <Box mt={2} display="flex" justifyContent="space-between">
              <Button
                variant="contained"
                fullWidth
                sx={{
                  backgroundColor: 'white',
                  color: 'black',
                  '&:hover': {
                    backgroundColor: 'lightgray',
                  },
                  marginRight: 1,
                }}
                onClick={handleEdit}
              >
                Edit
              </Button>
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
                onClick={handleCloseModal}
              >
                Close
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default PantryList;
