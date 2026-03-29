export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    if (document.getElementById('razorpay-script')) {
      const existing = document.getElementById('razorpay-script');
      existing.onload = () => resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const initiateRazorpayPayment = async ({ orderData, userInfo, onSuccess, onFailure }) => {
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    return onFailure('Failed to load Razorpay SDK. Check your internet connection.');
  }

  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount: orderData.amount,
    currency: orderData.currency || 'INR',
    name: 'Chronix',
    description: 'Premium Watch Purchase',
    image: 'https://cdn-icons-png.flaticon.com/512/7458/7458694.png',
    order_id: orderData.razorpayOrderId,
    prefill: {
      name: userInfo?.name || '',
      email: userInfo?.email || '',
      contact: userInfo?.phone || '',
    },
    theme: {
      color: '#F5A623',
      backdrop_color: 'rgba(10, 10, 15, 0.8)',
    },
    handler: (response) => onSuccess(response),
    modal: {
      ondismiss: () => onFailure('Payment was cancelled'),
      escape: true,
      backdropclose: false,
    },
  };

  const razorpay = new window.Razorpay(options);
  razorpay.on('payment.failed', (response) => {
    onFailure(`Payment failed: ${response.error.description}`);
  });
  razorpay.open();
};
