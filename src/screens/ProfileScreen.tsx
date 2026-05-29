import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
  Image,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import {launchImageLibrary} from 'react-native-image-picker';
import {MaterialCommunityIcons as Icon} from '../components/ui/Icon';
import {useNavigation} from '@react-navigation/native';
import {useAuthStore} from '../stores/useAuthStore';
import {useUserStore} from '../stores/useUserStore';
import {useNotificationStore} from '../stores/useNotificationStore';
import {updateProfile} from '../services/profileService';
import {supabase} from '../services/supabase';
import RNFS from 'react-native-fs';
import {PointsBadge} from '../components/ui/PointsBadge';
import {LevelBadge} from '../components/ui/LevelBadge';
import {LoadingOverlay} from '../components/ui/LoadingOverlay';

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const {session, logout} = useAuthStore();
  const {profile, streak, loadProfile} = useUserStore();
  const {unreadCount, refreshUnreadCount} = useNotificationStore();

  const [editVisible, setEditVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAvatarUri, setEditAvatarUri] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const userId = session?.user?.id;

  useEffect(() => {
    if (userId) {
      loadProfile(userId);
      refreshUnreadCount(userId);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (userId) {
        loadProfile(userId);
        refreshUnreadCount(userId);
      }
    }, [userId, loadProfile, refreshUnreadCount]),
  );

  const openEdit = () => {
    setEditName(profile?.full_name || '');
    setEditAvatarUri(profile?.avatar_url || '');
    setEditVisible(true);
  };

  const pickAvatar = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.7,
      maxWidth: 400,
      maxHeight: 400,
      selectionLimit: 1,
    });

    const asset = result.assets?.[0];
    if (!asset?.uri) return;

    setIsUploading(true);
    try {
      const actualPath = asset.uri.startsWith('file://') ? asset.uri.slice(7) : asset.uri;
      const filePath = `avatars/${userId}/${Date.now()}.jpg`;
      const base64 = await RNFS.readFile(actualPath, 'base64');
      const binaryStr = global.atob(base64);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      const {error} = await supabase.storage
        .from('waste-photos')
        .upload(filePath, bytes as any, {contentType: 'image/jpeg', upsert: true});
      if (error) throw error;
      const {data: urlData} = supabase.storage.from('waste-photos').getPublicUrl(filePath);
      setEditAvatarUri(urlData.publicUrl);
    } catch (e: any) {
      Alert.alert('Gagal', 'Gagal mengupload foto: ' + (e.message || 'Unknown error'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!userId) return;
    setIsSaving(true);
    try {
      await updateProfile(userId, {
        full_name: editName.trim() || null,
        avatar_url: editAvatarUri || null,
      });
      await loadProfile(userId);
      setEditVisible(false);
    } catch (e: any) {
      Alert.alert('Gagal', e.message || 'Gagal menyimpan profil.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Konfirmasi', 'Apakah Anda yakin ingin keluar?', [
      {text: 'Batal', style: 'cancel'},
      {text: 'Keluar', style: 'destructive', onPress: logout},
    ]);
  };

  const menuItems = [
    {icon: 'history', label: 'Riwayat Transaksi', screen: 'TransactionHistory'},
    {icon: 'gift', label: 'Katalog Hadiah', screen: 'RewardCatalog'},
    {icon: 'bell', label: 'Notifikasi', screen: 'Notifications', badge: unreadCount},
  ];

  return (
    <>
      <LoadingOverlay visible={isSaving} message="Menyimpan..." />
      <ScrollView style={[styles.container, {paddingTop: insets.top}]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={openEdit} style={styles.avatarContainer}>
            <View style={styles.avatar}>
              {profile?.avatar_url ? (
                <Image source={{uri: profile.avatar_url}} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>
                  {(profile?.full_name || 'E')[0].toUpperCase()}
                </Text>
              )}
            </View>
            <View style={styles.editBadge}>
              <Icon name="pencil" size={14} color="#fff" />
            </View>
          </TouchableOpacity>

          <Text style={styles.name}>{profile?.full_name || 'Eco Warrior'}</Text>

          <View style={styles.stats}>
            <PointsBadge points={profile?.points_balance ?? profile?.eco_points ?? 0} size="small" />
            <LevelBadge level={profile?.level ?? 1} />
          </View>

          <View style={styles.streakRow}>
            <Icon name="fire" size={18} color="#FF9800" />
            <Text style={styles.streakText}>{streak?.current_streak ?? 0} hari streak</Text>
            <Text style={styles.streakSub}>Terbaik: {streak?.longest_streak ?? 0} hari</Text>
          </View>

          <TouchableOpacity style={styles.editButton} onPress={openEdit}>
            <Icon name="account-edit" size={16} color="#4CAF50" />
            <Text style={styles.editButtonText}>Edit Profil</Text>
          </TouchableOpacity>
        </View>

        {menuItems.map(item => (
          <TouchableOpacity
            key={item.label}
            style={styles.menuItem}
            onPress={() => navigation.navigate(item.screen)}>
            <View style={styles.menuLeft}>
              <Icon name={item.icon} size={24} color="#4CAF50" />
              <Text style={styles.menuLabel}>{item.label}</Text>
            </View>
            <View style={styles.menuRight}>
              {item.badge ? <Text style={styles.badge}>{item.badge}</Text> : null}
              <Icon name="chevron-right" size={24} color="#BDBDBD" />
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="logout" size={20} color="#F44336" />
          <Text style={styles.logoutText}>Keluar</Text>
        </TouchableOpacity>

        <View style={{height: 32}} />
      </ScrollView>

      <Modal visible={editVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profil</Text>

            <Text style={styles.inputLabel}>Nama Lengkap</Text>
            <TextInput
              style={styles.input}
              value={editName}
              onChangeText={setEditName}
              placeholder="Masukkan nama"
              placeholderTextColor="#9E9E9E"
            />

            <Text style={styles.inputLabel}>Foto Profil</Text>
            <TouchableOpacity style={styles.avatarPicker} onPress={pickAvatar} disabled={isUploading}>
              {editAvatarUri ? (
                <Image source={{uri: editAvatarUri}} style={styles.avatarPreview} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Icon name="camera-plus" size={32} color="#9E9E9E" />
                  <Text style={styles.avatarPlaceholderText}>Pilih dari Galeri</Text>
                </View>
              )}
              {isUploading && (
                <View style={styles.uploadingOverlay}>
                  <Text style={styles.uploadingText}>Uploading...</Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setEditVisible(false)}>
                <Text style={styles.cancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
                disabled={isSaving}>
                <Text style={styles.saveText}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F5F5F5'},
  header: {alignItems: 'center', padding: 24, backgroundColor: '#fff'},
  avatarContainer: {position: 'relative', marginBottom: 12},
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {width: 80, height: 80, borderRadius: 40},
  avatarText: {fontSize: 32, fontWeight: '700', color: '#2E7D32'},
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4CAF50',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  name: {fontSize: 20, fontWeight: '700', color: '#333', marginBottom: 12},
  stats: {flexDirection: 'row', gap: 8, marginBottom: 12},
  streakRow: {flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 12},
  streakText: {fontSize: 14, fontWeight: '600', color: '#E65100'},
  streakSub: {fontSize: 12, color: '#9E9E9E', marginLeft: 8},
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  editButtonText: {fontSize: 14, color: '#4CAF50', fontWeight: '600'},
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 1,
  },
  menuLeft: {flexDirection: 'row', alignItems: 'center', gap: 16},
  menuLabel: {fontSize: 16, color: '#333'},
  menuRight: {flexDirection: 'row', alignItems: 'center', gap: 8},
  badge: {
    backgroundColor: '#F44336',
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    paddingVertical: 12,
  },
  logoutText: {fontSize: 16, color: '#F44336', fontWeight: '600'},
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputLabel: {fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 6},
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
  },
  modalButtons: {flexDirection: 'row', gap: 12, marginTop: 8},
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BDBDBD',
    alignItems: 'center',
  },
  cancelText: {fontSize: 16, color: '#666', fontWeight: '600'},
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
  },
  saveText: {fontSize: 16, color: '#fff', fontWeight: '600'},
  avatarPicker: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F5F5F5',
    alignSelf: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  avatarPreview: {width: 120, height: 120, borderRadius: 60},
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  avatarPlaceholderText: {fontSize: 11, color: '#9E9E9E', marginTop: 4},
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadingText: {color: '#fff', fontSize: 12, fontWeight: '600'},
});
