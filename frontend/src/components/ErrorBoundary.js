import React from 'react';
import { View, Text, ScrollView } from 'react-native';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ScrollView style={{ flex: 1, backgroundColor: '#f8d7da', padding: 20 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#721c24', marginBottom: 10 }}>Something went wrong.</Text>
          <Text style={{ color: '#721c24', marginBottom: 10 }}>{this.state.error && this.state.error.toString()}</Text>
          <Text style={{ fontFamily: 'monospace', fontSize: 12 }}>{this.state.errorInfo && this.state.errorInfo.componentStack}</Text>
        </ScrollView>
      );
    }
    return this.props.children;
  }
}
