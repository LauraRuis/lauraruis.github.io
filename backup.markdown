
# crf_FG

$$
\begin{aligned}
p(\mathbf{y} \mid \mathbf{x}) &= \frac{1}{Z(\mathbf{x})} \prod_{t=1}^{m} \psi(y_t, \mathbf{x}, t) \prod_{t=1}^{m-1}\psi(y_t, y_{t+1}) \\
 \end{aligned}$$
 
# crf_def

$$
\begin{aligned}
p(\mathbf{y} \mid \mathbf{x}) &= \frac{1}{Z(\mathbf{x})} \prod_{t=1}^{m} \exp\left(\boldsymbol{\theta}_1 \cdot f(y_t, \mathbf{x}, t)\right)\prod_{t=1}^{m-1} \exp\left(\boldsymbol{\theta}_2 \cdot f(y_t, y_{t+1})\right) \\ 
  &= \frac{1}{Z(\mathbf{x})} \exp\left(\sum_{t=1}^m \boldsymbol{\theta}_1 \cdot f(y_t, \mathbf{x}, t) + \sum_{t=1}^{m-1} \boldsymbol{\theta}_2 \cdot f(y_t, y_{t+1})\right) \\
Z(\mathbf{x}) &= \sum_{\mathbf{y}^{\prime}}\exp\left(\sum_{t=1}^m \boldsymbol{\theta}_1 \cdot f(y^{\prime}_t, \mathbf{x}, t) + \sum_{t=1}^{m-1} \boldsymbol{\theta}_2 \cdot f(y^{\prime}_t, y^{\prime}_{t+1})\right)
 \end{aligned}$$
 
# log_likelihood

$$
\begin{aligned}
\log \mathcal{L}(\boldsymbol{\theta}) &= \log{\prod_{i=1}^N p(\mathbf{y}^{(i)} \mid \mathbf{x}^{(i)}, \boldsymbol{\theta}) } =  \log{\Bigg[\prod_{i=1}^N \frac{1}{Z(\mathbf{x}^{(i)})}\prod_{t=1}^m \psi (y_t^{(i)}, \mathbf{x}_t^{(i)}, t) \prod_{t=1}^{m-1} \psi (y_t^{(i)}, y_{t+1}^{(i)}) \Bigg]} \\
    &=  \log{\Bigg[\prod_{i=1}^N \frac{1}{Z(\mathbf{x}^{(i)})} \exp\Bigg(\sum_{t=1}^m \boldsymbol{\theta}_1 f(y_t^{(i)}, \mathbf{x}_t^{(i)}, t) + \sum_{t=1}^{m-1} \boldsymbol{\theta}_2 f(y_t^{(i)}, y_{t+1}^{(i)})\Bigg)\Bigg]} \\
    &= \log{\Bigg[\prod_{i=1}^N \exp\Bigg(\sum_{t=1}^m \boldsymbol{\theta}_1 f(y_t^{(i)}, \mathbf{x}_t^{(i)}, t) + \sum_{t=1}^{m-1} \boldsymbol{\theta}_2 f(y_t^{(i)}, y_{t+1}^{(i)})\Bigg)\Bigg]} + \log{\Bigg[\prod_{i=1}^N \frac{1}{Z(\mathbf{x}^{(i)})} \Bigg]} \\
    &= \sum_{i=1}^{N}\sum_{t=1}^m \boldsymbol{\theta}_1 f(y_t^{(i)}, \mathbf{x}_t^{(i)}, t) + \sum_{t=1}^{m-1} \boldsymbol{\theta}_2 f(y_t^{(i)}, y_{t+1}^{(i)}) - \sum_{i=1}^{N}\log\left(Z(\mathbf{x}^{(i)})\right) \\
\end{aligned}
$$

# log_gradients

$$
\begin{aligned}
\nabla_{\boldsymbol{\theta}_1} \log \mathcal{L}(\boldsymbol{\theta}) &= \sum_{i=1}^{N}\sum_{t=1}^m f(y_t^{(i)}, \mathbf{x}_t^{(i)}, t) - \sum_{i=1}^N \nabla_{\boldsymbol{\theta}_1} \log(Z(\mathbf{x}^{(i)}))  \\
\nabla_{\boldsymbol{\theta}_1} \log(Z(\mathbf{x}^{(i)})) &= \frac{\nabla_{\boldsymbol{\theta}_1}Z(\mathbf{x}^{(i)})}{Z(\mathbf{x}^{(i)})} \\
&= \frac{\sum_{\mathbf{y}^{\prime}}\exp\left(\sum_{t=1}^m \boldsymbol{\theta}_1 \cdot f(y^{\prime(i)}_t, \mathbf{x}^{(i)}, t) + \sum_{t=1}^{m-1} \boldsymbol{\theta}_2 \cdot f(y^{\prime(i)}_t, y^{\prime(i)}_{t+1})\right) \cdot \sum_{t=1}^m f(y_t^{\prime(i)},\mathbf{x}^{(i)},t)}{Z(\mathbf{x}^{(i)})} \\
&= \sum_{t=1}^m\sum_{y_1^{\prime}}\dots\sum_{y_m^{\prime}} p(\mathbf{y}^{\prime(i)} \mid \mathbf{x}^{(i)})  \cdot f(y_t^{\prime(i)},\mathbf{x}^{(i)},t) \\
&= \sum_{t=1}^m\sum_{y^{\prime}_t} p(y^{\prime(i)}_t \mid \mathbf{x}^{(i)})  \cdot f(y_t^{\prime(i)},\mathbf{x}^{(i)},t)
\end{aligned}
$$