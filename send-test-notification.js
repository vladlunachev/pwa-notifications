const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('\n🔔 FCM Notification Tester\n');

rl.question('Enter the FCM token from your device: ', (token) => {
    if (!token || token.trim() === '') {
        console.log('❌ No token provided. Exiting...');
        rl.close();
        return;
    }

    rl.question('Enter notification title (default: "Test from Server"): ', (title) => {
        rl.question('Enter notification body (default: "Hello from FCM!"): ', (body) => {
            const notificationData = {
                token: token.trim(),
                title: title.trim() || 'Test from Server',
                body: body.trim() || 'Hello from FCM!',
                data: {
                    sentAt: new Date().toISOString(),
                    source: 'test-script'
                }
            };

            console.log('\n📤 Sending notification...\n');

            fetch('http://localhost:3000/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(notificationData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log('✅ Notification sent successfully!');
                    console.log('Message ID:', data.messageId);
                    console.log('Sent at:', data.sentAt);
                } else {
                    console.log('❌ Failed to send notification');
                    console.log('Error:', data.error);
                }
            })
            .catch(error => {
                console.log('❌ Error sending request:', error.message);
                console.log('\nMake sure the server is running: npm run server');
            })
            .finally(() => {
                rl.close();
            });
        });
    });
});
