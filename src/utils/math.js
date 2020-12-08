function dotProduct(a, b) {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}

function vectorLength(v) {
    return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

function vectorMinus(a, b) {
    const axises = ['x', 'y', 'z'];
    const result = {};
    for (let i = 0; i < axises.length; i++) {
        const axis = axises[i];
        result[axis] = a[axis] - b[axis];
    }

    return result
}

function normalized(v) {
    const length = vectorLength(v);
    return { x: v.x / length, y: v.y / length, z: v.z / length };
}

export {
    dotProduct,
    vectorLength,
    vectorMinus,
    normalized
}
