# Procedurem  ![npm bundle size](https://img.shields.io/bundlephobia/minzip/procedurem) [![npm](https://img.shields.io/npm/v/procedurem)](https://www.npmjs.com/package/procedurem)
A small (2kb) and performant isomorphic RPC library for TypeScript.

# Benchmarks
AWS T2.Small

| Clients | Payload | Throughput | Average   |
|---------|---------|------------|-----------|
| 1       | 1 kb    | 3030 kbps  | 0.33 ms   |
| 1       | 10 kb   | 17857 kbps | 0.56 ms   |
| 1       | 100 kb  | 29069 kbps | 3.44 ms   |
| 10      | 1 kb    | 680 kbps   | 1.47 ms   |
| 10      | 10 kb   | 2638 kbps  | 3.79 ms   |
| 10      | 100 kb  | 3175 kbps  | 31.49 ms  |
| 100     | 1 kb    | 71 kbps    | 14.03 ms  |
| 100     | 10 kb   | 252 kbps   | 39.59 ms  |
| 100     | 100 kb  | 314 kbps   | 318.45 ms |
