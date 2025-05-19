const bcrypt = require('bcryptjs');

const plainPassword = '12345';
const saltRounds = 10; // Güvenlik için önerilen değer

bcrypt.hash(plainPassword, saltRounds, function(err, hash) {
    if (err) {
        console.error(err);
        return;
    }
    console.log('Hashlenmiş Şifre:', hash);
});
