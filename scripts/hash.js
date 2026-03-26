import crypto from 'crypto';

async function hash(password) {
  const salt = '_proexel_salt_2026';
  const data = Buffer.from(password + salt, 'utf8');
  const hashBuffer = crypto.createHash('sha256').update(data).digest();
  return hashBuffer.toString('hex');
}

async function run() {
  console.log('dir123:', await hash('dir123'));
  console.log('comp123:', await hash('comp123'));
  console.log('chef123:', await hash('chef123'));
  console.log('tec123:', await hash('tec123'));
}
run();
