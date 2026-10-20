"""
Turns a leaf photo into 1280 numbers using MobileNetV2, a small neural network
that was already trained on ImageNet (1.2 million everyday photos).

We never train this part. It already knows general visual patterns (edges, colours,
textures, spots). The 1280 numbers it produces describe what the photo looks like,
and a simple classifier (see train.py) learns which numbers mean which disease.

The first call downloads the pre-trained weights (about 14 MB) and caches them.
"""
from functools import lru_cache


@lru_cache(maxsize=1)
def _load():
    from torchvision import models
    import torch

    weights = models.MobileNet_V2_Weights.IMAGENET1K_V1
    net = models.mobilenet_v2(weights=weights)
    net.classifier = torch.nn.Identity()  # drop the 1000-class ImageNet head, keep the 1280 features
    net.eval()
    return net, weights.transforms()  # transforms: resize, crop to 224x224, normalise


def embed(images):
    """list of PIL images (RGB) -> numpy array of shape (n, 1280)"""
    import torch

    net, preprocess = _load()
    batch = torch.stack([preprocess(img) for img in images])
    with torch.no_grad():
        return net(batch).numpy()
