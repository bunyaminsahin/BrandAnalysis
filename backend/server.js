const app = require('./app');

// macOS ControlCenter 5000 portunu işgal ettiği için varsayılan olarak 3007 portu kullanılır
const PORT = process.env.PORT || 3007;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
});