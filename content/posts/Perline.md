---
title: "Perlin Noise from Scratch"
date: "2026-03-30"
description: "How I built a Perlin noise generator in C++ with SFML to understand procedural generation, seeds, and smooth randomness."
---

## Overview

I made this because I wanted to understand how procedural generation works.

I had this curiosity about games and how they create worlds that feel random but are still controlled. Minecraft was one of the things in my mind. It uses a seed. The world changes based on that seed. That made me wonder how this whole thing actually works.

Then I came across Perlin noise in a YouTube video. After that I thought I should try it myself from scratch. I did not want to just use a library and move on. I wanted to understand what is going on behind it.

I also started thinking about seeds in other places too. Like in LLMs and image generation. The same seed gives the same output. So it is random but also not random. That idea was interesting to me and I wanted to explore it.

So I started this project in C++ using SFML. First I wanted to draw a window. Then I wanted to make randomness. Then I wanted to understand the math behind Perlin noise. That was the whole journey.

## What I Built

I built a simple Perlin noise generator that creates a grayscale noise image.

The idea is simple:

- Split the screen into a grid
- Give each grid point a random direction vector
- For each pixel, find the nearby grid corners
- Calculate how much each corner affects that pixel
- Blend everything smoothly

That is how the final noise comes out. It is not just random pixels — it is smooth noise that looks more natural.

## Why I Wanted to Do This

I wanted to understand procedural generation properly. It always felt like one of those things people use in games and graphics and just move on. But I wanted to know what is actually happening.

- How can a seed create a whole pattern?
- How does pseudo-random work?
- Why does the output look natural and not fake?

I also wanted to build it myself because later I want to try the same thing in React. But before that I needed to understand the real math and logic first.

## How I Learned It

I did not start with the full idea at once.

First I just learned how to open a window and draw pixels with SFML. That part was easy.

Then I started thinking about randomness. At first I tried just doing some math on numbers — add something, divide something, mix bits. But the output was too patterned. It did not feel random enough.

So I went deeper and started looking at hashing and bitwise operations. That helped a lot. I understood that if I give the same input I should get the same output. That is what makes it **deterministic**. And if I mix the bits properly the result can still look random.

## The Math

Before Perlin noise makes sense you need to understand a few things.

### Vectors

A vector is like an arrow. It has direction and length. In this project vectors are used to show direction at each grid point.

### Unit Vectors

A unit vector is a vector with length 1 — just a direction arrow, no size. That was useful because I did not want random vectors with random sizes. I just wanted the direction.

### Gradient Vectors

A gradient vector is the direction attached to a grid point. You can imagine the screen as small squares. At each corner there is a little arrow. That arrow tells the algorithm how the noise should behave around that point.

## How Perlin Noise Works

For each pixel I do this:

- Find which square cell it belongs to
- Take the four corner vectors around that cell
- Find the distance from each corner to the pixel
- Take the **dot product** between the corner vector and the distance vector
- Blend those values together using interpolation

That blending is important. Without it the result would be sharp and blocky.

### Interpolation

Interpolation is what makes the whole thing smooth. Instead of jumping from one value to another, the values blend gradually across the cell. That is why noise looks like clouds or terrain — not static.

This was one of the most important things I learned. **Smoothness is not a small detail. It is the whole reason Perlin noise looks good.**

### Why Grayscale

After I get the final noise value I map it to brightness. Dark means low value. Light means high value. The math turns into a picture.

## What I Learned

- Randomness can be deterministic
- Seeds are really important
- Vectors are not just theory — they are useful and visual
- Gradient vectors control the direction of change
- Interpolation is what makes things smooth
- Perlin noise is not magic — it is just math done in the right way

## Closing

This project started because I was curious about games and seeds and randomness. Then I got deeper into the math, and once I understood it the whole thing started making sense.

Perlin noise felt like a big concept at first. But after building it myself it became much easier to understand. It is just controlled randomness — and that was the thing I wanted to learn.

Github link: <a href="https://github.com/animeshchaudhri/Perline-noise-cpp">Perline-noise-cpp</a>