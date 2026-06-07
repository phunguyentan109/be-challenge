var sum_to_n_a = function(n) {
	const sign = n < 0 ? -1 : 1;
	const absN = Math.abs(n);

	return sign * absN * (absN + 1) / 2;
};

var sum_to_n_b = function(n) {
	let sum = 0;
	const sign = n < 0 ? -1 : 1;
	const absN = Math.abs(n);

	for (let i = 1; i <= absN; i++) {
		sum += i;
	}

	return sign * sum;
};

var sum_to_n_c = function(n) {
	if (n === 0) return 0
	if (n < 0) return -sum_to_n_c(-n)

	return n + sum_to_n_c(n - 1)
};

console.log(sum_to_n_a(5));
console.log(sum_to_n_b(5));
console.log(sum_to_n_c(5));
