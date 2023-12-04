((n = 1) => require(`./day${n.trim().padStart(2, '0')}/index.js`)())(process.argv[2] || 1);
