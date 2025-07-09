(function() {
  const Chatbox = window.Chatbox || {};

  console.log("Chatbox on widget", Chatbox);

  if (!document.getElementById('my-chatbox-iframe')) {

    // Convert object to query string
    const queryString = new URLSearchParams(Chatbox).toString();

    const iframe = document.createElement('iframe');
    iframe.id = 'my-chatbox-iframe';
    iframe.src = `http://chat.sourcefile.online/?${queryString}`;

    iframe.style.position = 'fixed';
    iframe.style.top = '0';
    iframe.style.left = '0';
    iframe.style.width = '100vw';
    iframe.style.height = '100vh';
    iframe.style.border = 'none';
    iframe.style.zIndex = '9999';
    iframe.style.margin = '0';
    iframe.style.padding = '0';
    iframe.style.overflow = 'hidden';

    document.body.appendChild(iframe);
  }
})();
