import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {useForm, Controller} from 'react-hook-form';
import {yupResolver} from '@hookform/resolvers/yup';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {MaterialCommunityIcons as Icon} from '../components/ui/Icon';
import {useAuthStore} from '../stores/useAuthStore';
import {loginSchema, LoginFormValues} from '../utils/validation';

export function LoginScreen() {
  const insets = useSafeAreaInsets();
  const login = useAuthStore(s => s.login);
  const loginWithEmail = useAuthStore(s => s.loginWithEmail);
  const [isGoogleLoading, setGoogleLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: {errors, isSubmitting},
  } = useForm<LoginFormValues>({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await loginWithEmail(data.email, data.password);
    } catch (error: any) {
      Alert.alert('Login Gagal', error.message || 'Email atau password salah.');
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      console.log('masu login');

      await login();
    } catch (error: any) {
      console.log('🚀 ~ handleGoogleLogin ~ error:', error);
      Alert.alert('Login Gagal', error.message || 'Silakan coba lagi.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {paddingTop: insets.top + 32, paddingBottom: insets.bottom + 32},
        ]}
        keyboardShouldPersistTaps="handled">
        <Text style={styles.logo}>{'\u267B'}</Text>
        <Text style={styles.title}>EcoReward</Text>
        <Text style={styles.subtitle}>Pilah Sampah, Dapatkan Hadiah</Text>

        <View style={styles.form}>
          <Controller
            control={control}
            name="email"
            render={({field: {onChange, onBlur, value}}) => (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  placeholder="Masukkan email"
                  placeholderTextColor="#BDBDBD"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
                {errors.email && (
                  <Text style={styles.errorText}>{errors.email.message}</Text>
                )}
              </View>
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({field: {onChange, onBlur, value}}) => (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={[styles.input, errors.password && styles.inputError]}
                  placeholder="Masukkan password"
                  placeholderTextColor="#BDBDBD"
                  secureTextEntry
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
                {errors.password && (
                  <Text style={styles.errorText}>
                    {errors.password.message}
                  </Text>
                )}
              </View>
            )}
          />

          <TouchableOpacity
            style={[styles.loginButton, isSubmitting && styles.buttonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            activeOpacity={0.8}>
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Masuk</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>atau</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogleLogin}
          disabled={isGoogleLoading}>
          {isGoogleLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Icon name="google" size={24} color="#fff" />
              <Text style={styles.googleText}>Masuk dengan Google</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.dummyHint}>
          Demo: demo@ecoreward.id / password123
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 32,
  },
  logo: {fontSize: 64, marginBottom: 16},
  title: {fontSize: 32, fontWeight: '800', color: '#2E7D32'},
  subtitle: {fontSize: 16, color: '#757575', marginTop: 8, marginBottom: 40},
  form: {width: '100%', gap: 16},
  inputGroup: {gap: 4},
  label: {fontSize: 14, fontWeight: '600', color: '#424242'},
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#212121',
    backgroundColor: '#FAFAFA',
  },
  inputError: {borderColor: '#F44336'},
  errorText: {fontSize: 12, color: '#F44336', marginTop: 2},
  loginButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonText: {color: '#fff', fontSize: 16, fontWeight: '700'},
  buttonDisabled: {opacity: 0.6},
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 24,
    gap: 12,
  },
  dividerLine: {flex: 1, height: 1, backgroundColor: '#E0E0E0'},
  dividerText: {fontSize: 14, color: '#9E9E9E'},
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4285F4',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
    gap: 12,
    minHeight: 50,
    justifyContent: 'center',
  },
  googleText: {color: '#fff', fontSize: 16, fontWeight: '600'},
  dummyHint: {
    fontSize: 12,
    color: '#9E9E9E',
    marginTop: 24,
    textAlign: 'center',
  },
});
