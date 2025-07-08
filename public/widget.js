(function() {
  const crmKey = window.ChatboxCRMKey || 'default-crm';

  const iframe = document.createElement('iframe');
  iframe.src = `http://i8wo0cs00g4os84cwkc8sowo.31.97.61.92.sslip.io/?crmKey=${crmKey}`;
  iframe.style.position = 'fixed';
  iframe.style.bottom = '20px';
  iframe.style.right = '20px';
  iframe.style.width = '350px';
  iframe.style.height = '500px';
  iframe.style.border = 'none';
  iframe.style.zIndex = '9999';
  iframe.style.borderRadius = '10px';
  iframe.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';

  document.body.appendChild(iframe);
})();