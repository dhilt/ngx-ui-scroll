module.exports = {
  '*.ts': () => 'npm run lint',
  '*.{ts,js,html,scss,md,json}': 'prettier --write'
};
