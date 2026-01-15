export default {
    // 1. Desactiva las transformaciones automáticas (Babel)
    transform: {}, 
    
    // 2. Indica que estamos en un entorno Node
    testEnvironment: 'node',
    
    // 3. (Opcional) Si tus tests tardan, aumenta el timeout
    testTimeout: 20000 
};