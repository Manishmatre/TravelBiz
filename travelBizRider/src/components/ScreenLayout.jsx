import React from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';

/**
 * A reusable layout component that ensures proper screen structure.
 * It provides a header slot, a main content area that fills available space,
 * and a footer slot that sticks to the bottom.
 *
 * @param {object} props
 * @param {React.ReactNode} props.header - Component to render as the header.
 * @param {React.ReactNode} props.children - The main content of the screen.
 * @param {React.ReactNode} props.footer - Component to render as the footer.
 * @param {object} props.style - Custom styles for the main container.
 */
const ScreenLayout = ({ header, children, footer, style }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#2563eb" />
      <View style={[styles.container, style]}>
        {header}
        <View style={styles.content}>
          {children}
        </View>
        {footer}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff', // A neutral background for the safe area
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa', // Default background color for screens
  },
  content: {
    flex: 1, // This is the key: it makes the content area expand
    // and push the footer to the bottom.
  },
});

export default ScreenLayout; 