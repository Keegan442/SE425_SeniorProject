import { useState, useContext } from 'react';
import { View, Text, Pressable, ScrollView, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { useTheme } from '../theme/ThemeContext';
import { getColors, getAppStyles } from '../style/appStyles';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { AuthContext } from '../auth/AuthContext';
import { addCategory } from '../api/categoriesApi';

export default function AddCategoryScreen() {
  const { theme, toggleTheme } = useTheme();
  const { session } = useContext(AuthContext);
  const navigation = useNavigation();

  const colors = getColors(theme);
  const styles = getAppStyles(colors);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!session?.userId) {
        Alert.alert('Error', 'Please sign in');
        return;
    }

    if (!name.trim()) {
        Alert.alert('Invalid Name', 'Category name is required');
        return;
    }

    try {
        setLoading(true);

        await addCategory(
        session.userId,
        name.trim(),
        description.trim() || undefined,
        type
        );

        navigation.goBack();
    } catch (error) {
        console.error(error);
        Alert.alert('Error', 'Failed to add category');
    } finally {
        setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      
      {/* Header */}
      <View style={styles.screenHeaderRow}>
        <Pressable onPress={() => navigation.goBack()} style={styles.formBackButton}>
          <Text style={styles.formBackText}>← Back</Text>
        </Pressable>

        <Text style={styles.title}>Add Category</Text>

        <Pressable onPress={toggleTheme} style={styles.themeToggleButton}>
          <Image
            source={
              theme === 'dark'
                ? require('../../assets/images/DarkLogo.png')
                : require('../../assets/images/LightLogo.png')
            }
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Pressable>
      </View>

      <View style={styles.screen}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.formScrollContent}
        >
          <View style={styles.card}>

          <Text style={styles.formSectionTitle}>Category Type</Text>

            <View style={styles.chipRow}>
                <Pressable
                    style={[styles.chip, type === 'expense' && styles.chipSelected]}
                    onPress={() => setType('expense')}
                >
                    <Text style={[styles.chipText, type === 'expense' && styles.chipTextSelected]}>
                    Expense
                    </Text>
                </Pressable>

                <Pressable
                    style={[styles.chip, type === 'income' && styles.chipSelected]}
                    onPress={() => setType('income')}
                >
                    <Text style={[styles.chipText, type === 'income' && styles.chipTextSelected]}>
                    Income
                    </Text>
                </Pressable>
            </View>
            
            <Input
              label="Category Name"
              value={name}
              onChangeText={setName}
              placeholder="Groceries, Gas, etc"
            />

            <View style={styles.formSectionMargin}>
              <Input
                label="Description (optional)"
                value={description}
                onChangeText={setDescription}
                placeholder="Optional description"
              />
            </View>

          </View>

          <View style={styles.formButtonContainer}>
            <Button
              title="Save Category"
              onPress={handleSave}
              loading={loading}
              disabled={!name}
              variant="success"
            />
          </View>

          <View style={styles.formButtonContainer}>
            <Button
              title="Cancel"
              onPress={() => navigation.goBack()}
              variant="ghost"
            />
          </View>

        </ScrollView>
      </View>

    </SafeAreaView>
  );
}