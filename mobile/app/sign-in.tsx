import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useSimpleAuth } from './_layout';

const COLORS = { background: '#F8F9FA', surface: '#FFFFFF', primary: '#10B981', textDark: '#111827', textLight: '#6B7280', border: '#E5E7EB', error: '#EF4444' };
const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function SignIn() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false); // Loading state

  const { login } = useSimpleAuth();
  const router = useRouter();

  const handleLogin = async () => {
    setErrorMessage('');
    const cleanUsername = username.toLowerCase().trim();

    // Frontend Validations
    if (!cleanUsername || !password) {
      return setErrorMessage('Please enter both username and password.');
    }

    setLoading(true);

    try {
      // Send request to your backend to verify credentials
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanUsername, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Password is correct! Log them into the app context.
        login(data.username);
        router.replace('/');
      } else {
        // Wrong password or user not found
        setErrorMessage(data.error || data.message || 'Login failed.');
      }
    } catch (error) {
      setErrorMessage('Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.container}>
        <View style={styles.headerBox}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Log in to access your wallet.</Text>
        </View>

        <View style={styles.formCard}>
          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <Text style={styles.label}>Username</Text>
          <TextInput 
            style={styles.input} autoCapitalize="none" placeholder="e.g. developer123" 
            placeholderTextColor={COLORS.textLight} value={username} onChangeText={setUsername} 
          />

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput 
              style={styles.passwordInput} secureTextEntry={!showPassword} placeholder="••••••••" 
              placeholderTextColor={COLORS.textLight} value={password} onChangeText={setPassword} 
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color={COLORS.textLight} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Log In</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkButton} onPress={() => router.push('/sign-up' as any)} disabled={loading}>
            <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', padding: 20 },
  headerBox: { marginBottom: 40, alignItems: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: COLORS.textDark, marginBottom: 8 },
  subtitle: { fontSize: 16, color: COLORS.textLight },
  formCard: { backgroundColor: COLORS.surface, padding: 25, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  errorText: { color: COLORS.error, fontSize: 14, marginBottom: 15, textAlign: 'center', fontWeight: '500', backgroundColor: '#FEE2E2', padding: 10, borderRadius: 8 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.textDark, marginBottom: 8 },
  input: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, padding: 16, borderRadius: 12, fontSize: 16, color: COLORS.textDark, marginBottom: 20 },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, marginBottom: 20 },
  passwordInput: { flex: 1, padding: 16, fontSize: 16, color: COLORS.textDark },
  eyeIcon: { padding: 15 },
  button: { backgroundColor: COLORS.primary, padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  buttonText: { color: COLORS.surface, fontSize: 16, fontWeight: 'bold' },
  linkButton: { marginTop: 25, alignItems: 'center' },
  linkText: { color: COLORS.primary, fontWeight: '600', fontSize: 15 }
});